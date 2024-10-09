const api_url = 'http://localhost:8080';
var global_team_id = '';
var global_user_id = '';
var selected_request_id = 0;
var selected_requester = 0;
async function fetchRequests(searching_project_name, status) {
    try {
        await refreshAccessToken();
        const userData = await getEnteredUsersData();
        if (!userData) return;

        const teamListUrl = `${api_url}/users/teamlist/`;
        const teamListResponse = await axios.get(teamListUrl, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        if (teamListResponse.data.length) {

            const teamData = teamListResponse.data[0];
            global_team_id = teamData.id
            const teamTitle = teamData.title

            const myWorkRequesUrl = `${api_url}/requests/for-manager/`;
            const myWorkRequestResponse = await axios.get(myWorkRequesUrl, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                }
            });
            localStorage.setItem('teamTitle', teamTitle);
            localStorage.setItem('global_team_id', global_team_id);

            var workRequestsData = myWorkRequestResponse.data.filter(item => item.status === status);
            if (status == 'all') {
                workRequestsData = myWorkRequestResponse.data
            }
            if (searching_project_name.length > 0) {
                workRequestsData = workRequestsData.filter(item => item.announcement.project_name.toLowerCase().includes(searching_project_name.toLowerCase()));
            }
            let html = '';
            if (workRequestsData.length) {
                let html = '';
                workRequestsData.forEach(item => {
                    html += `
                        <div class="cardd mb-3 my-1" data-id="${item.id}" style="border-left: 10px solid ${item.status == 'accepted' ? "#31920b" : (item.status == 'refused' ? "#a41b0f" : "#ffc205")};">
                            <h2 style="border-bottom: 2px solid ${item.status == 'accepted' ? "#31920b" : (item.status == 'refused' ? "#a41b0f" : "#ffc205")};"><a href="../Announcements/details.html?id=${item.announcement.id}">Loyiha: <span id="project_name">${item.announcement.project_name}</a></span></h2>
                            <div class="section m-0 p-0">
                                <p>ID: <span class="highlight">${item.id}</span></p>
                            </div>
                            <div class="section m-0 p-0">
                                <p>Taklif qilgan jamoa: <span id="team-title-${item.id}" class="highlight"></span></p>
                            </div>
                            <div class="section m-0 p-0">
                                <p>FISH: <span id="team-leader-${item.id}" class="highlight"></span></p>
                            </div>
                            <div class="section m-0 p-0">
                                <p>Taklif qilingan muddat: <span class="highlight">${item.deadline}</span></p>
                            </div>
                            <div class="section m-0 p-0">
                                <p>Taklif qilingan narx: <span class="highlight">${item.cost}</span></p>
                            </div>
                            <div class="section m-0 p-0">
                                <p>Izoh: <span class="highlight">${item.description}</span></p>
                            </div>
                            <div class="section m-0 p-0">
                                <p>Status: <span class="highlight pb-2">${GetStatus(item.status)}</span></p>
                            </div>
                            <div class="footer m-0 p-1">
                                <p>Yaratilgan vaqt: <span>${item.created_at}</span></p>
                                ${item.status == 'pending' ? `
                                <button id="giveWorkButton_${item.id}" 
                                    onclick="handleButtonClick(${item.id},${item.requester})" 
                                    class="open-modal-button btn btn-success mx-2" data-bs-toggle="modal" data-bs-target="#giveWorkModal">
                                    Qabullash
                                </button>` : ''}
                            </div>
                        </div>`;
                });

                document.getElementById('projects_list').innerHTML = html;

                workRequestsData.forEach(item => {
                    axios.get(`${api_url}/users/getteamdatafromuser/${item.requester}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                        }
                    })
                        .then(response => {
                            const span = document.getElementById(`team-title-${item.id}`)
                            span.textContent = response.data.title;
                            const tagA = document.createElement('a');
                            tagA.href = `../Teams/details.html?id=${response.data.id}`;
                            tagA.target = '_blank'; 
                            span.parentNode.replaceChild(tagA, span);
                            tagA.appendChild(span);
                        })
                        .catch(error => {
                            document.getElementById(`team-title-${item.id}`).textContent = 'Ошибка загрузки';
                            //console.error('Ошибка при получении данных команды:', error);
                        });

                    axios.get(`${api_url}/users/userlist/${item.requester}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                        }
                    })
                        .then(response => {
                            document.getElementById(`team-leader-${item.id}`).textContent = response.data.first_name + " " + response.data.last_name;
                        })
                        .catch(error => {
                            document.getElementById(`team-leader-${item.id}`).textContent = 'XXX';
                            //console.error('Ошибка при получении данных команды:', error);
                        });
                });
            }

            else {
                html = `
                    <div class="cardd mb-4">
                        <h2 class="text-center">Ro'yxat bo'sh</h2>
                    </div>
                    `
            }
            document.getElementById("projects_list").innerHTML += html;
        }
    } catch (error) {
        //console.error(error);
    }
}

async function handleButtonClick(request_id, requester) {
    selected_request_id = request_id
    selected_requester = requester
    localStorage.setItem('pressed_request_id', request_id);
    const teamTitle = document.getElementById(`team-title-${request_id}`).textContent;
    document.getElementById('giveWorkModalLabel').textContent = `Ushbu proektni «${teamTitle}» jamoasiga bermoqchimisiz?`;
}

async function yes_Button_click() {
    try {
        const change_status_API = `${api_url}/requests/${selected_request_id}/`;
        const workRequestAcceptResponse = await axios.patch(change_status_API,
            {
                status: 'accepted'
            },
            {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                }
            }
        );
    window.location.reload();
    } catch (error) {
        //console.error(error);
        alert("errrrrrorro")
    }

}




document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('statusSelect').value = 'all'
    document.getElementById("filter_project_name").value = ''
    await fetchRequests('', 'all');
})

document.getElementById('statusSelect').addEventListener('change', async function () {
    document.getElementById('projects_list').innerHTML = ""

    await fetchRequests(document.getElementById("filter_project_name").value, this.value);
});

document.getElementById("filter_project_name").addEventListener("input", async (event) => {
    document.getElementById('projects_list').innerHTML = ""
    await fetchRequests(document.getElementById("filter_project_name").value, document.getElementById('statusSelect').value);

});

async function getEnteredUsersData() {
    const accessToken = localStorage.getItem("access_token");

    try {
        const response = await axios.get(`${api_url}/users/api/userinfo`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        return response.data;
    } catch (error) {
        window.location.href = "../../index.html"
        // console.error('Ошибка при получении информации о пользователе:', error.message);
        return null;
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
        //console.error("logout error: ", error);
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function GetStatus(str) {
    if (str == 'pending') {
        return `Kutilmoqda <i class="bi bi-circle-fill" style="color: #ffc205; font-size: 1.5rem;"></i>`
    }
    else if (str == 'refused') {
        return `Rad etdingiz <i class="bi bi-circle-fill" style="color: #a41b0f; font-size: 1.5rem;"></i>`
    }
    else {
        return `Qabulladingiz <i class="bi bi-circle-fill" style="color: #31920b; font-size: 1.5rem;"></i>`
    }
}
