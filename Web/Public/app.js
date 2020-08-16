$('#navbar').load('navbar.html');
$('#footer').load('footer.html');
const API_URL = 'https://api-eight-azure.vercel.app/api';
const MQTT_URL = 'http://localhost:5001/send-command';

const currentUser = localStorage.getItem('user');
if (currentUser) {
    $.get(`${API_URL}/users/${currentUser}/devices`)
        .then(response => {
            response.forEach((device) => {
                $('#devices tbody').append(`
 <tr data-device-id=${device._id}>
 <td>${device.user}</td>
 <td>${device.name}</td>
 </tr>`);
            });
            $('#devices tbody tr').on('click', (e) => {
                const deviceId = e.currentTarget.getAttribute('data-device-id');
                $.get(`${API_URL}/devices/${deviceId}/device-history`)
                    .then(response => {
                        response.map(sensorData => {
                            $('#historyContent').append(`
            <tr>
            <td>${sensorData.ts}</td>
            <td>${sensorData.temp}</td>
            <td>${sensorData.loc.lat}</td>
            <td>${sensorData.loc.lon}</td>
            </tr>
            `);
                        });
                        $('#historyModal').modal('show');
                    });
            });
        })
        .catch(error => {
            console.error(`Error: ${error}`);
        });
} else {
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/registeration') {
        location.href = '/login';
    }
}

$.get(`${API_URL}/devices`)
    .then(response => {
        response.forEach(device => {
            $('#devices tbody').append(`
 <tr>
 <td>${device.user}</td>
 <td>${device.name}</td>
 </tr>`);
        });
    })
    .catch(error => {
        console.error(`Error: ${error}`);
    });

$('#add-device').on('click', () => {
    const name = $('#name').val();
    const user = $('#user').val();
    const sensorData = [];
    const body = {
        name,
        user,
        sensorData
    };
    $.post(`${API_URL}/devices`, body)
        .then(response => {
            location.href = '/';
        })
        .catch(error => {
            console.error(`Error: ${error}`);
        });
});

$('#send-command').on('click', function() {
    const command = $('#command').val();
    console.log(`command is: ${command}`);
});

/*$('#register').on('click', function() {
 const username = $('#username').val();
 const password = $('#password').val();
 const confirm = $('#confirm').val();
 const exists = users.find(user => user.username === username);
 if (exists == undefined)
 {
     if(password == confirm)
     {
         users.push({username, password, confirm})
         localStorage.setItem('users', JSON.stringify(users));
         location.href = '/login';
     }
     else
     {
        $("#message").text("Passwords does not matches.");
     }
 }
 else
 {
    $("#message").text("User Already Exists.");
 }
});*/

$('#register').on('click', () => {
    const user = $('#username').val();
    const password = $('#password').val();
    const confirm = $('#confirm').val();
    if (password !== confirm) {
        $('#message').append('<p class="alert alert-danger">Passwords does not matches</p>');
    } else {
        $.post(` ${API_URL}/register`, { user, password })
            .then((response) => {
                if (response.success) {
                    location.href = '/login';
                } else {
                    $('#message').append(` <p class="alert alert-danger">${response}< /p>`);
                }
            });
    }
});

/*$('#login').on('click', function() {
    const username = $('#username').val();
    const password = $('#password').val();
    const exist = users.find(user => user.username === username);
    const exists = users.find(user => user.password === password);
    if (exist == undefined)
    {
       $("#message").text("User does not Exist.");
    }
    else
    {
       if(exists == undefined)
       {
           $("#message").text("Incorect Password.");
       }
   
       else
       {
           localStorage.setItem('isAuthenticated', JSON.stringify(true));
            location.href = '/';
       }
    }
   });*/

$('#login').on('click', () => {
    const user = $('#username').val();
    const password = $('#password').val();
    $.post(`${API_URL}/authenticate`, { user, password })
        .then((response) => {
            if (response.success) {
                localStorage.setItem('user', user);
                localStorage.setItem('isAdmin', response.isAdmin);
                //localStorage.setItem('isAuthenticated', true);
                location.href = '/';
            } else {
                $('#message').append(`<p class="alert alert-danger">${response}
   </p>`);
            }
        });
});

$('#send-command').on('click', () => {
    const deviceID = $('#deviceID').val();
    const command = $('#command').val();

    http: //localhost:5001/send-command
        $.post(`${MQTT_URL}`, { deviceID, command })
        .then((response) => {});
});

/*const logout = () => {
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
   }*/

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
}