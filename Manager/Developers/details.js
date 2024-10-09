const urlParams = new URLSearchParams(window.location.search);
const dev_id = urlParams.get('id');
var users_url = `http://localhost:8080`

async function setDevInfo() {
    await refreshAccessToken()
    try {
        const dev_data = (await axios.get(`${users_url}/users/developer/${dev_id}`, {
            headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })).data
        //console.log(dev_data);
        fish.innerText = dev_data.fish
        position.innerText = capitalize(dev_data.position)
        const aTag = document.createElement('a')
        aTag.href = `../Teams/details.html?id=${dev_data.team}`
        aTag.style.textDecoration = 'regular'
        aTag.textContent = (await axios.get(`${users_url}/users/teamlist/${dev_data.team}`, {
            headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })).data.title
        document.getElementById('teamtitle').appendChild(aTag)

        created_at.innerText = dev_data.created_at
        image.src = dev_data.image
    } catch (error) {

    }
}
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
        //console.error("logout error: ", error);
    }
}
async function refreshAccessToken() {
    try {
        const refresh_token = localStorage.getItem('refresh_token');
        axios.post(`${users_url}/api/token/refresh/`, {
            refresh: refresh_token
        }, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
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


(async () => {
    await setDevInfo()
})()
