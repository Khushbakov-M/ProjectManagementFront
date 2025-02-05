const api_url = 'https://projectmanagement-2s4q.onrender.com'

async function loadAnnouncements(searchingProjectName, searchingProjectType) {
    await refreshAccessToken()
    var html = ``;
    axios.get(api_url, {
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
                <h2>Loyiha: <span id="project_name" class="highlight">${item.project_name}</span></h2>
                <div class="section m-0">
                    <p><strong>ID:</strong> <span id="id">${item.id}</span></p>
                    <p><strong>Buyurtmachi:</strong> <span id="name_of_employer">${item.name_of_employer}</span></p>
                </div>
                <div class="section m-0">
                    <p><strong>Tashkilot Nomi:</strong> <span id="tashkilot_nomi" class="highlight">${item.tashkilot_nomi}</span></p>
                    <p><strong>Telefon Raqam:</strong> <span id="phone">${item.phone}</span></p>
                </div>
                <div class="section m-0">
                    <p><strong>Topshirish kuni:</strong> <span id="deadline">${item.deadline}</span></p>
                    <p><strong>Narx:</strong> <span id="cost">${item.cost}$</span></p>
                </div>
                <div class="btn-container">
                    <button id="detailBtn_${item.id}" class="btn btn-info mx-4 mt-0">Batafsil</button>
                </div>  
                </div>
                `;
            });

            document.getElementById("main").innerHTML = html;

            data.forEach(item => {
                document.getElementById(`detailBtn_${item.id}`).addEventListener('click', function () {
                    const itemId = this.getAttribute('id').split('_')[1];
                    viewDetails(itemId)
                });
            });
            // console.log(response.data);
        })
        .catch(function (error) {
            // console.log(error);
        });

    document.getElementById('myForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const form = document.getElementById('myForm');
        const formData = new FormData(form);

        formData.append('file1', formData.get('file1'));
        formData.append('file2', formData.get('file2'));
        formData.append('file3', formData.get('file3'));

        formData.append('project_name', formData.get('project_name'));
        formData.append('deadline', formData.get('deadline'));
        formData.append('cost', formData.get('cost'));
        formData.append('tashkilot_nomi', formData.get('tashkilot_nomi'));
        formData.append('description', formData.get('description'));
        formData.append('phone', formData.get('phone'));
        formData.append('name_of_employer', formData.get('name_of_employer'));

        for (var pair of formData.entries()) {
            // console.log(pair[0] + ': ' + pair[1]);
        }

        axios.post(`${api_url}`, formData, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
            .then(function (response) {
                window.location.href = 'announcements.html';
            })
            .catch(function (error) {
                // console.error('Xato:', error.response ? error.response.data : error.message);
                alert('Xato: ' + (error.response ? translateErrorMessage(error.response.data.error_massage) : error.message));
            });
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    document.getElementById("filter_project_name").value = ''
    document.getElementById('typeSelect').value = 'all'
    await loadAnnouncements('', 'all');

    document.getElementById('clearFile1Btn').addEventListener('click', function () {
        document.getElementById('file1').value = '';
    });

    document.getElementById('clearFile2Btn').addEventListener('click', function () {
        document.getElementById('file2').value = '';
    });

    document.getElementById('clearFile3Btn').addEventListener('click', function () {
        document.getElementById('file3').value = '';
    });
});

document.getElementById('typeSelect').addEventListener('change', async function () {
    document.getElementById('main').innerHTML = ""
    await loadAnnouncements(document.getElementById("filter_project_name").value, this.value);
});

document.getElementById("filter_project_name").addEventListener("input", async (event) => {
    document.getElementById('main').innerHTML = ""
    await loadAnnouncements(document.getElementById("filter_project_name").value, document.getElementById('typeSelect').value);
});

function viewDetails(ann_id) {
    window.location.href = `details.html?id=${ann_id}`;
}

function translateErrorMessage(errorMessage) {
    const translations = {
        "undefined": "Maydonlar bo'sh bo'lishi mumkin emas!",
        "Invalid phone number": "Telefon raqami noto'g'ri kiritilgan!",
    };
    return translations[errorMessage] || errorMessage;
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
