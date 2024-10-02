const users_url = 'http://localhost:8080'

document.getElementById('btn_login').addEventListener('click', function (event) {
    // console.log(username.value)
    // console.log(password.value)
    axios.post(`${users_url}/users/login/`, {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    })
    .then(function (response) {
        let message = response.data.message;
        if(message==='true'){
            let token_access = response.data.token.access
            let token_refresh = response.data.token.refresh
            let role = response.data.role
            localStorage.setItem('access_token', token_access);
            localStorage.setItem('refresh_token', token_refresh);
            if (role === 'project_manager') {
                window.location.href = 'Manager/dashboard.html';
            } else if (role === 'captain') {
                window.location.href = 'Captain/dashboard.html';
            } 
        }
        else{
            // console.log(message);
        }
    })
    .catch(function (error) {

        // console.error("Shu yerda",error);
    })
})
