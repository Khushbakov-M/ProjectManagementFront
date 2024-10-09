var users_url = `http://localhost:8080`
async function getAllDevelopers(selectedTeamID) {
    await refreshAccessToken()
    await axios.get(`${users_url}/users/developer/`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        .then(res => {
            var all_devs = res.data
            if (all_devs.length) {

                all_devs = selectedTeamID == 0?res.data:all_devs.filter(item => item.team == selectedTeamID);

                var html = ''
                all_devs.forEach(element => {
                    html +=
                        `   
                    <div class="col-12 col-md-6 col-lg-3 mt-5 each-dev">
                        <a href="details.html?id=${element.id}">
                            <div class="card border-0 border-bottom border-primary shadow-sm overflow-hidden">
                                <div class="card-body p-0">
                                    <figure class="m-0 p-0">
                                        <img class="w-100" loading="lazy" src=${element.image} alt="" height="300px">
                                        <figcaption class="m-0 p-4">
                                            <h4 class="mb-1 text-center">${element.fish}</h4>
                                            <p class="text-secondary mb-0 text-center mt-2">Yo'nalishi: ${element.position}</p>
                                            <p class="text-secondary mb-0 text-center mt-2">${element.created_at}</p>
                                        </figcaption>
                                    </figure>
                                </div>
                            </div>
                        </a>        
                    </div>     
                    `
                });
                document.getElementById("cards").innerHTML = html;
            }
        })
        .catch(err => {
            //console.error(err)
        })
}

document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

async function logOut() {
    try {
        const s = await axios.post(`${users_url}/api/logout/`, {
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
        axios.post(`${users_url}/api/token/refresh/`, {
            refresh: refresh_token
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

document.getElementById('teamSelect').addEventListener('change', async function () {
    document.getElementById('cards').innerHTML = ""
    await getAllDevelopers(this.value)
});


async function fillTeamsSelect() {
    const teamData = (await axios.get(`${users_url}/users/teamlist`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })).data
    const teamSelect = document.getElementById('teamSelect');

    teamData.forEach(optionData => {
        const option = document.createElement('option');
        option.value = optionData.id;
        option.textContent = optionData.title;

        teamSelect.appendChild(option);
    });

}

(async () => {
    await fillTeamsSelect()
    await getAllDevelopers("0")
})()
