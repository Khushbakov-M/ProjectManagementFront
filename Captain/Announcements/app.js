const api_url = 'http://localhost:8080'
var selected_ann_id = 0
var selected_ann_title = 0

async function loadAnnouncements(searchingProjectName, searchingProjectType) {

    var html = ``;
    await axios.get(api_url, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        .then(function (response) {
            let data = response.data;
            if (searchingProjectType == 'active') {
                data = data.filter(item => item.assigned_to);
            }
            else if (searchingProjectType == 'accepted') {
                data = data.filter(item => !item.assigned_to);
            }
            if (searchingProjectName) {
                data = data.filter(item => item.project_name.toLowerCase().includes(searchingProjectName.toLowerCase()));
            }
            data.forEach(item => {
                html += `<div class="card mt-0 ${item.assigned_to ? "bg-success-subtle" : "bg-success-light"}">
                <h2>Loyiha: <span id="project_name" class="highlight"><a href="details.html?id=${item.id}">${item.project_name}</a></span></h2>
                <div class="section  m-0">
                    <p><strong>ID:</strong> <span id="id">${item.id}</span></p>
                </div>
                <div class="section  m-0">
                    <p><strong>Topshirish kuni:</strong> <span id="deadline">${item.deadline}</span></p>
                    <p><strong>Narx:</strong> <span id="cost">${item.cost}</span></p>
                </div> 
                <div class="section  m-0 pb-0"> 
                    <p><strong>Izoh:</strong> <span style="display: inline-block; max-width: 80%; word-wrap: break-word;" id="description">${item.description}</span></p>
                </div>`;
                
                if (item && (item.file || item.file2 || item.file3)) {
                    html += `<p class="h5 text-center">Biriktirilgan hujjatlar:</p>
                    <div class="d-flex justify-content-center">
                    <ul class="d-flex p-0">`;
                    if (item.file) {
                        html += `
                        <li>
                            <div class="document-card my-1">
                                <a href="${item.file}"><p class="text-center m-0">${getFileName(item.file)}</p></a>
                            </div>
                        </li>`;
                    }
                    if (item.file2) {
                        html += `
                        <li>
                            <div class="document-card my-1">
                                <a href="${item.file2}"><p class="text-center m-0">${getFileName(item.file2)}</p></a>
                            </div>
                        </li>`;
                    }
                    if (item.file3) {
                        html += `
                        <li>
                            <div class="document-card my-1">
                                <a href="${item.file3}"><p class="text-center m-0">${getFileName(item.file3)}</p></a>
                            </div>
                        </li>`;
                    }
                    html += `</ul></div>`;
                }
            
                if (!item.assigned_to) {
                    html += `
                    <div class="btn-container">
                        <button data-id=${item.id} id="sendRequestBtn_${item.id}" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#sendRequestModal">Sorov jo'natish</button>
                    </div>`;
                }
            
                html += `</div>`;
            });
            

            document.getElementById("main").innerHTML = html; // Corrected this line

            data.forEach(item => {
                let btn = document.getElementById(`sendRequestBtn_${item.id}`)
                if (btn) {
                    btn.addEventListener('click', async function () {
                        selected_ann_id = this.getAttribute('id').split('_')[1];
                        selected_ann_title = (await axios.get(`${api_url}/${selected_ann_id}/`,
                            {
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                                }
                            })).data.project_name

                        // console.log(selected_ann_title)
                        proekt_nomi.innerHTML += ` <strong>«${selected_ann_title}»</strong>`
                    });
                }
            });
            // console.log(response.data);
        })
        .catch(function (error) {
            // handle error
            // console.log(error);
        });
}
document.getElementById('sendButton').addEventListener('click', async function () {
    // try {
    await refreshAccessToken()
    const userResponse = await axios.get(`${api_url}/users/api/userinfo/`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    // console.log("userdata", userResponse.data);
    try {
        await axios.post(`${api_url}/requests/`, {
            announcement: selected_ann_id,
            requester: userResponse.data.id,
            deadline: document.getElementById('myDeadline').value,
            cost: document.getElementById('myCost').value,
            description: document.getElementById('myDescription').value
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
            window.location.reload()
    } catch (error) {
        if (error.response.data.non_field_errors) {
            const modalElement = document.getElementById('sendRequestModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            // console.log("Tanlangan ");
            modalInstance.hide()
        }
        // console.log(error);
    }

})

document.addEventListener('DOMContentLoaded', async function () {
    await refreshAccessToken()
    document.getElementById("filter_project_name").value = ''
    document.getElementById('typeSelect').value = 'all'
    await loadAnnouncements('', 'all')
})
// SelectedChanged
document.getElementById('typeSelect').addEventListener('change', async function () {
    document.getElementById('main').innerHTML = ""
    await loadAnnouncements(document.getElementById("filter_project_name").value, this.value);
});
// TextChanged
document.getElementById("filter_project_name").addEventListener("input", async (event) => {
    document.getElementById('main').innerHTML = ""
    await loadAnnouncements(document.getElementById("filter_project_name").value, document.getElementById('typeSelect').value);
});

function getFileName(url) {
    let parts = url.split('/');
    let fileName = parts[parts.length - 1];
    
    let nameParts = fileName.split('*');
    let mainName = nameParts[0]; 
    let extension = fileName.split('.').pop();

    return mainName + '.' + extension;
}

function translateErrorMessage(errorMessage) {
    // Implement your translation logic here
    // For example, you can have a dictionary of translations
    const translations = {
        "undefined": "Maydonlar bo'sh bo'lishi mumkin emas!",
        "Invalid phone number": "Telefon raqami noto'g'ri kiritilgan!",
        // Add more translations as needed
    };
    // Return the translated message if found in translations, else return original message
    return translations[errorMessage] || errorMessage;
}
document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

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
    const refresh_token = localStorage.getItem('refresh_token');

    try {
        const response = await axios.post(`${api_url}/api/token/refresh/`, {
            refresh: refresh_token
        });

        if (response.status === 200) {
            const new_access_token = response.data.access;
            localStorage.setItem('access_token', new_access_token);
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        window.location.href = "../../index.html";
    }
}