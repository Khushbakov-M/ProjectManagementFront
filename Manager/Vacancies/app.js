const api_url = 'https://projectmanagement-2s4q.onrender.com'

var global_team_id = localStorage.getItem('global_team_id')
async function loadData(filter) {
    try {
        var vacanciesData = (await axios.get(`${api_url}/users/vacancies/`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })).data
        if (vacanciesData.length) {
            var all = await vacanciesData.map(async item => {
                let teamtitle = (await axios.get(`${api_url}/users/teamlist/${item.team}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } })).data.title
                return `
                        <div class="cardd mb-3 my-1" data-id="${item.id}" >
                            <h2 style="border-bottom: 2px solid black">Jamoa: <span id="teamname">${teamtitle}</span></h2>
                            <div class="section m-0">
                                <p>Soha: <span class="highlight">${capitalize(item.position)}</span></p>
                            </div>
                            <div class="section m-0">
                                <p><strong>Izoh:</strong> <span style="display: inline-block; max-width: 80%; word-wrap: break-word;" id="description">${item.description}</span></p>                            
                            </div>
                            <div class="footer">
                                <p><span>${item.created_at}</span></p>
                            </div>
                        </div>
                    `;
            });
            Promise.all(all).then(results => {
                document.getElementById("vacancies_list").innerHTML = results.join('');
            })
        }
        else {
            document.getElementById("vacancies_list").innerHTML = `
            <div class="cardd my-4">
                <h2 class="text-center">Ro'yxat bo'sh</h2>
            </div>
            `;
        }
    } catch (error) {
        //console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await refreshAccessToken()
    await loadData('all')
})


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
        //console.error(err);
    }
}
