const api_url = 'http://localhost:8080'

var global_team_id = localStorage.getItem('global_team_id')
async function loadData(filter) {
    // try {
        var vacanciesData = (await axios.get(`${api_url}/users/vacancies/`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })).data
        if (filter == 'myteam') {
            vacanciesData = vacanciesData.filter(item => item.team == global_team_id)
        }
        if (vacanciesData.length) {
            var all = await vacanciesData.map(async item => {
                let teamtitle = (await axios.get(`${api_url}/users/teamlist/${item.team}`, { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } })).data.title
                return `
                        <div class="cardd mb-3 my-1" data-id="${item.id}" >
                            <h2 style="border-bottom: 2px solid black">Jamoa: <span id="teamname">${teamtitle}</span></h2>
                            <div class="section m-0">
                                <p>ID: <span class="highlight">${item.id}</span></p>
                            </div>
                            <div class="section m-0">
                                <p>Soha: <span class="highlight">${capitalize(item.position)}</span></p>
                            </div>
                            <div class="section m-0">
                                <p><strong>Izoh:</strong> <span style="display: inline-block; max-width: 80%; word-wrap: break-word;" id="description">${item.description}</span></p>                            
                            </div>
                            <div class="footer">
                                <p><span>${item.created_at}</span></p>
                                ${item.team == global_team_id ? `<div class="btn-container">
                                <button id="deleteBtn_${item.id}" class="btn btn-danger mx-4 mt-0">O'chirish</button>
                            </div>`:``}
                                
                            </div>
                            
                        </div>
                    `;
            });
            Promise.all(all).then(results => {
                document.getElementById("vacancies_list").innerHTML = results.join('');
                vacanciesData.forEach(item => {
                    document.getElementById(`deleteBtn_${item.id}`).addEventListener('click', async function () {
                        if(confirm(`O'chirishga aminmisiz?`)){
                            await axios.delete(`${api_url}/users/vacancies/${item.id}/`, {
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                                }
                            })
                        }
                        window.location.reload();
                    });
                });
            })
            
            
        }
        else {
            document.getElementById("vacancies_list").innerHTML = `
            <div class="cardd my-4">
                <h2 class="text-center">Ro'yxat bo'sh</h2>
            </div>
            `;
        }
        
    // } catch (error) {
    //     console.log(error);
    // }
}

document.addEventListener('DOMContentLoaded', async function () {
    await refreshAccessToken()
    await loadData('all')
    
})

// SelectedChanged
document.getElementById('filterSelect').addEventListener('change', async function () {
    // document.getElementById('vacancies_list').innerHTML = ""
    await loadData(this.value);
});


document.getElementById('sendButton').addEventListener('click', async function () {
    await refreshAccessToken()
    try {
        await axios.post(`${api_url}/users/vacancies/`, {
            team: global_team_id,
            position: developerForMeSelect.value,
            description: myDescription.value
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        window.location.reload();
    } catch (error) {

    }
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
