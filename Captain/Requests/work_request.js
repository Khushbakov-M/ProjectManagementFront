async function fillModalWithDevs(){
    await refreshAccessToken()
    const eachDeveloperContainer = document.getElementById('each-developer-container');
    const submitButton = document.getElementById('give-btn');
    const teamTitle1 = localStorage.getItem('teamTitle');
    const global_team_id1 = localStorage.getItem('global_team_id');
    const devListUrl = `${api_url}/users/developer/${teamTitle1}/${global_team_id1}`;
    try {
        const devListResponse = await axios.get(devListUrl, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });

        const devData = devListResponse.data;

        devData.forEach(item => {
            const eachDeveloper = document.createElement('div');
            eachDeveloper.className = 'each-developer';
            eachDeveloper.dataset.id = item.id;
            eachDeveloper.innerHTML = `
                <img class="rounded-circle mb-2" src=${item.image} width="60px">
                <h5>${item.fish}</h5>
                <p>${item.position}</p>
            `;
            eachDeveloper.addEventListener('click', () => {
                eachDeveloper.classList.toggle('selected');
            });
            eachDeveloperContainer.appendChild(eachDeveloper);
        });

        // Обработка отправки данных
        submitButton.addEventListener('click', async () => {
            const selectedEachDevelopers = document.querySelectorAll('.each-developer.selected');
            const selectedIds = Array.from(selectedEachDevelopers).map(eachDeveloper => eachDeveloper.dataset.id);
            const announcement_id = localStorage.getItem('pressed_announcement_id');
            if (selectedIds.length) {
                const postData = {
                    announcement: announcement_id,
                    team: global_team_id1,
                    request: global_selected_request_id,
                    developers: selectedIds
                };

                //console.log('Post Data:', postData); // Log data being sent

                try {
                    const response = await axios.post(`${api_url}/users/subteamlist/`, postData, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                        }
                    });

                    //console.log('Server Response:', response.data); // Log server response
                    alert("Muvaffaqiyatli");
                } catch (error) {
                    //console.error('Error posting subteam list:', error.response.data); // Log error response
                    window.location.reload();
                }
            }
            else {
                alert('Dasturchilarni tanlang')
            }

        });
    } catch (error) {
        //console.error('Error fetching developer list:', error);
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
