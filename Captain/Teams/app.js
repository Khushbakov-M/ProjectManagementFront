const api_url = 'https://projectmanagement-2s4q.onrender.com';
var global_team_id = ''
async function fetchTeamList() {
    // try {
    await refreshAccessToken();
    const userData = await getEnteredUsersData();
    if (!userData) return;

    const userId = userData.id;
    const teamListUrl = `${api_url}/users/teamlist/with-user/${userId}`;

    const teamListResponse = await axios.get(teamListUrl, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });
    const teamData = teamListResponse.data[0];
    global_team_id = teamData.id
    const teamTitle = teamData.title
    let html = '';
    if (teamListResponse.data.length) {
        html = `
        <div class="cardd" data-id="${teamData.id}">
        
          <h2 class="d-flex justify-content-between"><div>Mening jamoam: <span id="project_name"><strong>${teamData.title}</strong></span></div>
            <button type="button" id="toggleButton" class="btn btn-circle"></button>
          </h2>
          
          <div class="section">
            <p>ID: <span id="id" class="highlight">${teamData.id}</span></p>
          </div>
          <div class="section m-0">
            <p>Jamoa sardori: <span id="team_captain" class="highlight">${teamData.user.first_name} ${teamData.user.last_name}</span></p>
          </div>
          <div class="section m-0">
            <p>Lavozim: <span id="team_captain" class="highlight">Jamoa sardori</span></p>
          </div>
          <div class="section m-0">
            <p>Username: <span id="team_captain" class="highlight">${teamData.user.username}</span></p>
          </div>
          <div class="footer">
            <p>Yaratilgan vaqt: <span id="created_at">${teamData.created_at}</span></p>
          </div>
        </div>
      `;
    } else {
        html = `
        <div class="card">
          <div class="card-headers">
            <h2 class="text-center">Jamoa yo'q</h2>
          </div>
        </div>
      `;
    }
    document.getElementById("main").innerHTML = html;

    const teamEmploymentData = (await axios.get(`${api_url}/users/team-employment/`)).data;
    const teamEmploymentItem = teamEmploymentData.filter(item => item.team == global_team_id)[0];

    if (teamEmploymentItem && teamEmploymentItem.status === "free") {
        document.getElementById('toggleButton').classList.add('btn-success');
    } else {
        document.getElementById('toggleButton').classList.add('btn-danger');
    }
    document.getElementById('toggleButton').addEventListener('click', async function () {

        this.classList.toggle('btn-danger');
        this.classList.toggle('btn-success');

        if (this.classList.contains('btn-success')) {
            try {
                await axios.patch(`${api_url}/users/team-employment/team/${global_team_id}`, { status: 'free' }, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
            } catch (error) {
                //console.error(error);
            }
        } else if (this.classList.contains('btn-danger')) {
            try {
                await axios.patch(`${api_url}/users/team-employment/team/${global_team_id}`, { status: 'busy' }, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
            } catch (error) {
                //console.error(error);
            }
        }
    });


    const devListUrl = `${api_url}/users/developer/${teamTitle}/${global_team_id}`;

    const devListResponse = await axios.get(devListUrl,
        {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
    const devData = devListResponse.data;
    let dev_card = '';
    if (devData.length > 0) {
        devData.forEach(item => {
            dev_card += `
          <div class="card pb-1">
            <div class="photo-box d-flex justify-content-center">
              <img src="${item.image}" alt="Photo">
            </div>
            <div class="section">
              <p><strong>Familiya:</strong> ${item.fish.split(' ')[0]}</p>
              <p><strong>Ism:</strong> ${item.fish.split(' ')[1] ? item.fish.split(' ')[1] : '?'}</p>
            </div>
            <div class="section">
              <p><strong>Jamoa:</strong> ${item.team.title}</p>
              <p><strong>Yo'nalishi:</strong> ${capitalize(item.position)}</p>
            </div>
            <div class="section text-end mb-2">
              <button data-id="${item.id}" class="btn btn-danger bi-trash-fill"> O'chirish</button>
            </div>
          </div>
        `;
        });
    } else {
        const emptylabel = document.getElementById("dev_list");
        emptylabel.innerText = "Ro'yxat bo'sh";
        emptylabel.classList.add("text-danger");
        emptylabel.classList.add("justify-content-center");
    }
    document.getElementById("dev_list").innerHTML += dev_card;

    document.querySelectorAll('.btn-danger').forEach(button => {
        button.addEventListener('click', function() {
            const selected_dev_id = this.getAttribute('data-id');
            if (confirm("O'chirishga aminmisiz?")) {
                axios.delete(`${api_url}/users/developer/${selected_dev_id}`)
            }
            window.location.reload();
        });
    });
}

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

fetchTeamList();

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

document.getElementById('btn-submit').addEventListener('click', async function (event) {
    event.preventDefault();
    const formData = new FormData(document.getElementById('addDeveloperForm'));
    formData.append('team', global_team_id);
    try {
        await axios.post(`${api_url}/users/developer/`, formData, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        // Close the modal
        const addDeveloperModal = new bootstrap.Modal(document.getElementById('addDeveloperModal'));
        addDeveloperModal.hide();
        // Optionally refresh the developer list
        fetchTeamList();
        window.location.reload();
    } catch (error) {
        //console.error('Error adding developer:', error);
    }
});
