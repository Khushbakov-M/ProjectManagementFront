const urlParams = new URLSearchParams(window.location.search);
const team_id = urlParams.get('id');
const users_url = 'http://localhost:8080'
var User_id = 0
var Title = ''
var Username = ''
var First_name = ''
var Last_name = ''
var Password = ''

document.addEventListener('DOMContentLoaded', async function () {
    refreshAccessToken()
    axios.get(`${users_url}/users/teamlist/${team_id}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        .then(function (response) {
            User_id = response.data.user.id;
            Title = response.data.title;
            Username = response.data.user.username;
            First_name = response.data.user.first_name;
            Last_name = response.data.user.last_name;
            Password = response.data.user.password;
            document.getElementById("team_container").innerHTML = `
            <div class="card" data-id="${team_id}">  
            <div class="card-headers d-flex justify-content-end">
                <h2>Jamoa nomi: <span id="team_title">${Title}</span></h2>
                <div class="buttons-container">
                    <button onclick="${update_modal_open()}" class="btnn btn-edit" data-bs-toggle="modal" data-bs-target="#teamEditModal"><i class="bi-pen"></i></button>
                    <button id="delete_team" class="btnn btn-delete"><i class="bi bi-trash-fill"></i></button>
                </div>
                
            </div>
                <div class="section">
                    <p>ID: <span id="id" class="highlight">${team_id}</span></p>
                </div>
                <div class="section">
                    <p>Jamoa sardori: <span id="team_captain_flnames" class="highlight">${First_name} ${Last_name}</span></p>
                </div> 
                <div class="section">
                    <p>Username: <span id="team_captain_username" class="highlight">${Username}</span></p>
                </div> 
                <p class="text-center display-5">Dasturchilar</p>
                <div id="dev_list" class="dev-list d-flex justify-content-center mx-1 mb-3">
                    <div class="accordion w-100" id="developer_accordion">
                        
                    </div>
                </div>
                <div class="footer">
                    <p>Yaratilgan vaqt: <span id="created_at">${response.data.created_at}</span></p>
                    <p>Tahrirlangan vaqt: <span id="updated_at">${response.data.updated_at == response.data.created_at ? "Tahrirlanmagan" : response.data.updated_at}</span></p>
                </div>
            </div>
            
            `;
            
            axios.get(`${users_url}/users/developer/${Title}/${team_id}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                }
            })
                .then(function (response) {
                    let accordions = ''
                    let data = response.data
                    if (data.length > 0) {
                        data.forEach(item => {
                            accordions += `
                            <div class="accordion-item border-bottom-0">
                                <h2 class="accordion-header" id="heading${item.id}">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${item.id}" aria-expanded="true" aria-controls="collapse${item.id}">
                                        ${item.fish}
                                    </button>
                                </h2>
                                <div id="collapse${item.id}" class="accordion-collapse collapse" aria-labelledby="heading${item.id}" data-bs-parent="#developer_accordion">
                                    <a href="../Developers/details.html?id=${item.id}">
                                        <div class="accordion-body link-opacity-75-hover border-bottom">
                                            <img class="rounded-circle mx-4" width=110px height=110px src="${item.image}" alt="">
                                            <strong>Yo'nalishi:</strong> ${capitalize(item.position)}
                                        </div>
                                    </a>
                                </div>
                            </div>
                            `
                        })
                        document.getElementById("developer_accordion").innerHTML = accordions;
                    }
                    else {
                        emptylabel = document.getElementById("dev_list")
                        emptylabel.innerText = "Ro'yxat bo'sh"
                        emptylabel.classList.add("text-danger")
                    }
                })
                .catch(function (error) {
                    // console.log(error);
                });


            document.getElementById("delete_team").addEventListener('click', function (event) {
                if (confirm("O'chirishga aminmisiz?")) {
                    axios.delete(`${users_url}/users/teamlist/${team_id}`, {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                        }
                    })
                        .then(function (response) {
                            axios.delete(`${users_url}/users/userlist/${User_id}`, {
                                headers: {
                                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                                }
                            })
                                .then(function (response) {
                                    window.location.href = "teams.html";
                                })
                                .catch(function (error) {
                                    if (error.response) {
                                        // console.error('Error response (user delete):', error.response);
                                        // alert(`Error ${error.response.status}: ${error.response.data}`);
                                    } else if (error.request) {
                                        // console.error('Error request (user delete):', error.request);
                                        // alert('No respons/e received from server when deleting user.');
                                    } else {
                                        // console.error('Error message (user delete):', error.message);
                                        // alert('Error: ' + error.message);
                                    }
                                });
                        })
                        .catch(function (error) {
                            if (error.response) {
                                // console.error('Error response (team delete):', error.response);
                                // alert(`Error ${error.response.status}: ${error.response.data}`);
                            } else if (error.request) {
                                // console.error('Error request (team delete):', error.request);
                                // alert('No response received from server when deleting team.');
                            } else {
                                // console.error('Error message (team delete):', error.message);
                                // alert('Error: ' + error.message);
                            }
                        });
                }
            });
        })
        .catch(function (error) {
            // Handle error
            // console.log(error);
        });
})


function update_modal_open() {
    document.getElementById("title").value = Title;
    document.getElementById("username").value = Username;
    document.getElementById("first_name").value = First_name;
    document.getElementById("last_name").value = Last_name;
}

document.getElementById("update").addEventListener('click', function (event) {

    axios.put(`${users_url}/users/teamlist/${team_id}`, {
        title: document.getElementById("title").value
    }, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
        .then(function (response) {
            // console.log('Team updated:', response.data);
            // console.error(response.data);
            // alert('Команда успешно обновлена');

            // Обновление информации о пользователе
            const userData = {
                username: document.getElementById("username").value,
                first_name: document.getElementById("first_name").value,
                last_name: document.getElementById("last_name").value
            };

            // Добавляем поле password, если оно не пустое
            const password = document.getElementById("password").value;
            if (password !== "") {
                userData.password = password;
            }
            else {
                userData.password = Password;
            }

            // console.log(`Updating user with ID: ${User_id}`, userData);
            axios.put(`${users_url}/users/userlist/${User_id}`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    // console.error('User updated:', response.data);
                    alert('Пользователь успешно обновлен');
                    window.location.href = "jamoalar.html";
                })
                .catch(function (error) {
                    if (error.response) {
                        if (error.response.data.username) {
                            alert("Ushbu username allaqachon band bo'lgan.");
                        }
                    } else if (error.request) {
                        // console.error('Error request:', error.request);
                        // alert('No response received from server.');
                    } else {
                        // console.error('Error message:', error.message);
                        // alert('Error: ' + error.message);
                    }
                });
        })
        .catch(function (error) {
            // console.error('Error updating team:', error);
            alert('Произошла ошибка при обновлении команды');
        });
});

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
        // console.error("logout error: ", error);
    }
}

async function refreshAccessToken() {
    try {
        const refresh_token = localStorage.getItem('refresh_token');
        axios.post(`${users_url}/api/token/refresh/`, {
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