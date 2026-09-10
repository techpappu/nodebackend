const state = { token: localStorage.getItem("token"), user: null, notes: [] };
const $ = (selector) => document.querySelector(selector);

function showMessage(text, error = false) {
  const box = $("#message");
  box.textContent = text;
  box.className = `message${error ? " error" : ""}`;
  setTimeout(() => box.classList.add("hidden"), 4000);
}

async function api(path, options = {}) {
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Request failed");
  return json.data;
}

function formData(form) { return Object.fromEntries(new FormData(form)); }
function setSession(user, token) {
  state.user = user; state.token = token;
  if (token) localStorage.setItem("token", token); else localStorage.removeItem("token");
  $("#auth-view").classList.toggle("hidden", !!user);
  $("#app-view").classList.toggle("hidden", !user);
  $("#session").classList.toggle("hidden", !user);
  $("#admin-tab").classList.toggle("hidden", user?.role !== "ADMIN");
  $("#user-name").textContent = user ? `${user.name} · ${user.role}` : "";
}

async function loadNotes() {
  const data = await api("/notes?page=1&limit=100"); state.notes = data;
  $("#notes-list").innerHTML = data.length ? data.map(note => `<article class="item"><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.content)}</p><div class="meta">${new Date(note.updatedAt).toLocaleString()}</div><div class="actions"><button data-edit="${note._id}" class="secondary">Edit</button><button data-delete="${note._id}" class="danger">Delete</button></div></article>`).join("") : "<p>No notes yet.</p>";
}

function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }

$("#login-form").addEventListener("submit", async event => {
  event.preventDefault(); try { const result = await api("/auth/login", { method: "POST", body: JSON.stringify(formData(event.target)) }); setSession(result.user, result.token); await loadNotes(); } catch (e) { showMessage(e.message, true); }
});
$("#register-form").addEventListener("submit", async event => {
  event.preventDefault(); const body = formData(event.target); body.interests = body.interests.split(",").map(x => x.trim()).filter(Boolean);
  try { const result = await api("/auth/register", { method: "POST", body: JSON.stringify(body) }); setSession(result.user, result.token); await loadNotes(); } catch (e) { showMessage(e.message, true); }
});
$("#logout").addEventListener("click", () => setSession(null, null));
$("#refresh-notes").addEventListener("click", () => loadNotes().catch(e => showMessage(e.message, true)));

$("#note-form").addEventListener("submit", async event => {
  event.preventDefault(); const body = formData(event.target); const id = body.id; delete body.id;
  try { await api(id ? `/notes/${id}` : "/notes", { method: id ? "PUT" : "POST", body: JSON.stringify(body) }); resetNoteForm(); await loadNotes(); showMessage("Note saved"); } catch (e) { showMessage(e.message, true); }
});
function resetNoteForm() { $("#note-form").reset(); $("#note-form-title").textContent = "New note"; $("#cancel-edit").classList.add("hidden"); }
$("#cancel-edit").addEventListener("click", resetNoteForm);
$("#notes-list").addEventListener("click", async event => {
  const editId = event.target.dataset.edit, deleteId = event.target.dataset.delete;
  if (editId) { const note = state.notes.find(x => x._id === editId); const form = $("#note-form"); form.elements.id.value = note._id; form.elements.title.value = note.title; form.elements.content.value = note.content; $("#note-form-title").textContent = "Edit note"; $("#cancel-edit").classList.remove("hidden"); form.scrollIntoView({ behavior: "smooth" }); }
  if (deleteId && confirm("Delete this note?")) { try { await api(`/notes/${deleteId}`, { method: "DELETE" }); await loadNotes(); } catch (e) { showMessage(e.message, true); } }
});

async function loadPosts(userId = state.user._id) { const data = await api(`/users/${userId}/posts?page=1&limit=100`); $("#find-posts-form").elements.userId.value = userId; $("#posts-list").innerHTML = `<h3>${escapeHtml(data.name)}'s posts</h3>` + (data.posts.length ? data.posts.map(post => `<article class="item"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.content)}</p></article>`).join("") : "<p>No posts found.</p>"); }
async function loadPublicUsers() { const users = await api("/users/public?page=1&limit=100"); const select = $("#find-posts-form").elements.userId; const selected = select.value || state.user._id; select.innerHTML = `<option value="">Select a user</option>` + users.map(user => `<option value="${user._id}">${escapeHtml(user.name)}</option>`).join(""); select.value = selected; }
$("#post-form").addEventListener("submit", async event => { event.preventDefault(); try { await api("/posts", { method: "POST", body: JSON.stringify(formData(event.target)) }); event.target.reset(); await loadPosts(); showMessage("Post published"); } catch (e) { showMessage(e.message, true); } });
$("#find-posts-form").addEventListener("submit", async event => { event.preventDefault(); try { const data = await api(`/users/${formData(event.target).userId}/posts`); $("#posts-list").innerHTML = `<h3>${escapeHtml(data.name)}'s posts</h3>` + (data.posts.length ? data.posts.map(post => `<article class="item"><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.content)}</p></article>`).join("") : "<p>No posts found.</p>"); } catch (e) { showMessage(e.message, true); } });
$("#find-posts-form").elements.userId.addEventListener("change", event => { if (event.target.value) loadPosts(event.target.value).catch(e => showMessage(e.message, true)); });

async function loadUsers() { const data = await api("/users?page=1&limit=100"); $("#users-list").innerHTML = data.map(user => `<article class="item"><h3>${escapeHtml(user.name)}</h3><div>${escapeHtml(user.email)} · ${user.role}</div><div class="meta">ID: ${user._id}</div><div class="actions"><button class="secondary" data-role="${user._id}" data-current="${user.role}">Change role</button><button class="danger" data-remove-user="${user._id}">Delete</button></div></article>`).join(""); }
$("#admin-user-form").addEventListener("submit", async event => { event.preventDefault(); const body = formData(event.target); body.interests = []; try { await api("/users", { method: "POST", body: JSON.stringify(body) }); event.target.reset(); await loadUsers(); showMessage("User added"); } catch(e) { showMessage(e.message, true); } });
$("#users-list").addEventListener("click", async event => { const id = event.target.dataset.role || event.target.dataset.removeUser; if (!id) return; try { if (event.target.dataset.role) await api(`/users/${id}`, { method: "PUT", body: JSON.stringify({ role: event.target.dataset.current === "ADMIN" ? "USER" : "ADMIN" }) }); else if (confirm("Delete this user and their content?")) await api(`/users/${id}`, { method: "DELETE" }); else return; await loadUsers(); } catch(e) { showMessage(e.message, true); } });
$("#load-interests").addEventListener("click", async () => { try { const data = await api("/users/group/interests"); $("#interests-list").innerHTML = data.map(group => `<article class="item"><h3>${escapeHtml(group._id)} (${group.count})</h3><p>${group.users.map(user => escapeHtml(user.name)).join(", ")}</p></article>`).join(""); } catch (e) { showMessage(e.message, true); } });

document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-tab]").forEach(x => x.classList.remove("active")); button.classList.add("active");
  document.querySelectorAll(".panel").forEach(x => x.classList.add("hidden")); $(`#${button.dataset.tab}-panel`).classList.remove("hidden");
  if (button.dataset.tab === "admin") loadUsers().catch(e => showMessage(e.message, true));
  if (button.dataset.tab === "posts") Promise.all([loadPublicUsers(), loadPosts()]).catch(e => showMessage(e.message, true));
}));

(async function restoreSession() { if (!state.token) return; try { const user = await api("/auth/me"); setSession(user, state.token); await loadNotes(); } catch { setSession(null, null); } })();
