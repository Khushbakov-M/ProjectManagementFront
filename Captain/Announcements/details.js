const urlParams = new URLSearchParams(window.location.search);
const ann_id = urlParams.get('id');
const api_url = 'http://localhost:8080'
document.addEventListener('DOMContentLoaded', async function () {
    await refreshAccessToken()
    await axios.get(`${api_url}/${ann_id}/`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        .then(async function (response) {
            let ann_info = response.data;
            document.title = ann_info.project_name
            var team_id = null
            if (ann_info.assigned_to) {
                team_id = (await axios.get(`${api_url}/users/getteamdatafromuser/${ann_info.assigned_to}/`, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                })).data.id
            }
            let html = `
        <div class="card" id="card-${ann_info.id}">
            <h2>Loyiha: <span id="project_name" class="highlight">${ann_info.project_name}</span></h2>
            <div class="section">
                <p><strong>ID:</strong> <span id="id">${ann_info.id}</span></p>
            </div>
            <div class="section">
                <p><strong>Deadline:</strong> <span id="deadline">${ann_info.deadline}</span></p>
                <p><strong>Narx:</strong> <span id="cost">${ann_info.cost}</span></p>
            </div>
            <div class="section full-width">
                <p><strong>Izoh:</strong> <span id="description">${ann_info.description}</span></p>
                <p><strong>Tanlagan jamoa:</strong> <span id="assigned_to">${team_id ? `${ann_info.assigned_to_team}` : 'Berilmagan'}</span></p>
            </div>
            <div class="section">
                <p><strong>Documents:</strong></p>
                <ul id="documents" style="width: 100%; padding-left: 0; display: flex; flex-wrap: wrap;">`;
            if (ann_info.file) {
                html += `
            <li>
                <div class="document-card">
                    <a href="${ann_info.file}">Document 1</a>
                </div>
            </li>`;
            }
            if (ann_info.file2) {
                html += `
            <li>
                <div class="document-card">
                    <a href="${ann_info.file2}">Document 2</a>
                </div>
            </li>`;
            }
            if (ann_info.file3) {
                html += `
            <li>
                <div class="document-card">
                    <a href="${ann_info.file3}">Document 3</a>
                </div>
            </li>`;
            }
            html += `
                </ul>
            </div>
        </div>`; // Close the div tag

            document.getElementById('main').innerHTML = html;

            // console.log(response.data);
        })
        .catch(function (error) {
            // console.log(error);
        });
})

async function openUpdateModal(id) {
    await refreshAccessToken()
    // Get the announcement data
    await axios.get(`${api_url}/${id}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        .then(response => {
            const ann_info = response.data;
            document.getElementById('person').value = ann_info.person;
            document.getElementById('tashkilot_nomi').value = ann_info.tashkilot_nomi;
            document.getElementById('address').value = ann_info.address;
            document.getElementById('phone').value = ann_info.phone;
            document.getElementById('name_of_employer').value = ann_info.name_of_employer;
            document.getElementById('project_name').value = ann_info.project_name;
            document.getElementById('deadline').value = ann_info.deadline;
            document.getElementById('cost').value = ann_info.cost;
            document.getElementById('description').value = ann_info.description;
            // Clear file input fields
            // document.getElementById('file').value = ann_info.document.file
            // document.getElementById('file2').value = ann_info.document.file2
            // document.getElementById('file3').value = ann_info.document.file3
            // Open the modal
            document.getElementById('myUpdateModal').style.display = 'block';
        })
        .catch(error => {
            // console.error('Error:', error);
        });
}

document.getElementById('myUpdateForm').onsubmit = async function (event) {
    await refreshAccessToken()
    event.preventDefault();
    const formData = new FormData(document.getElementById('myUpdateForm'));
    formData.append('file', formData.get('file'));
    formData.append('file2', formData.get('file2'));
    formData.append('file3', formData.get('file3'));

    // Manually add other fields to FormData
    formData.append('person', formData.get('person'));
    formData.append('project_name', formData.get('project_name'));
    formData.append('deadline', formData.get('deadline'));
    formData.append('cost', formData.get('cost'));
    formData.append('tashkilot_nomi', formData.get('tashkilot_nomi'));
    formData.append('address', formData.get('address'));
    formData.append('description', formData.get('description'));
    formData.append('phone', formData.get('phone'));
    formData.append('name_of_employer', formData.get('name_of_employer'));
    // Log form data
    for (const [key, value] of formData.entries()) {
        // console.log(`${key}: ${value}`);
    }
    // console.log(formData.get('file'));
    // console.log(formData.get('file2'));
    // console.log(formData.get('file3'));

    // console.log(ann_id);
    axios.patch(`${api_url}/${ann_id}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then(response => {
            // console.log('Announcement updated:', response.data);
            // Refresh the page or close the modal
            document.getElementById('myUpdateModal').style.display = 'none';
            // Optionally, you could refresh the announcement details
            location.reload();
        })
        .catch(error => {
            // console.error('Error:', error.response.data);
        });
};

async function deleteCard(id) {
    await refreshAccessToken()
    if (confirm('Are you sure you want to delete this announcement?')) {
        axios.delete(`${api_url}/${id}/`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
            .then(response => {
                // console.log(response);
                window.location.href = 'announcements.html';
            })
            .catch(error => {
                // console.error('Error:', error);
            });
    }
}

document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

async function logOut() {
    try {
        const s = await axios.post(`${api_url}/api/logout/`, {
            refresh_token: localStorage.getItem('refresh_token')
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        window.location.href = "../../index.html";
    } catch (error) {
        // console.error("logout error: ", error);
    }
}
async function refreshAccessToken() {
    try {
        const refresh_token = localStorage.getItem('refresh_token');
        axios.post(`${api_url}/api/token/refresh/`, {
            refresh: refresh_token
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
            .then(function (response) {
                const new_access_token = response.data.access;
                localStorage.setItem('access_token', new_access_token);
            })
            .catch(function (error) {
                window.location.href = "../../index.html"
            });
    } catch (err) {
        // console.error(err);
    }
}

