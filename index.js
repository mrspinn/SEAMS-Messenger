var config = {
  apiKey: "AIzaSyBEDEGGuy0DaKgrXa6DIVwv_Eouor0u1wI",
  authDomain: "seams-messenger.firebaseapp.com",
  databaseURL: "https://seams-messenger.firebaseio.com",
  projectId: "seams-messenger",
  storageBucket: "seams-messenger.appspot.com",
  messagingSenderId: "879292557404"
};
firebase.initializeApp(config);

var currentUser;
var base = firebase.database();
var auth = firebase.auth();
var storage = firebase.storage();
var storageRef = storage.ref();

window.addEventListener("DOMContentLoaded", onDeviceReady, false);


function onDeviceReady() {
  document.getElementById('btnLogin').addEventListener('click', loginUser, false);
  document.getElementById('btnReg').addEventListener('click', createAccount, false);
  document.getElementById('btnLogout').addEventListener('click', signOut, false);
  document.getElementById('btnSaveProfile').addEventListener('click', saveProfile, false);
  document.getElementById('btnEditProfile').addEventListener('click', editProfile, false);
  document.getElementById('btnBackToMessage').addEventListener('click', backToMessage, false);
  auth.onAuthStateChanged(function(user) {
    if (user) {
      currentUser = user;
      showHide('currentUserDiv', 'login');
      document.getElementById('currentUser').innerHTML = user.email;
    } else {
      showHide('login', 'currentUserDiv');
    }
  });
  getOnlineUsers();
}

function createAccount() {
  var email = document.querySelector('#txtEmail').value;
  var password = document.querySelector('#txtPassword').value;
  auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert("Error Code: " + errorCode + "\nError Message: " + errorMessage);
  }).then(function() {
    setTimeout(function() {
      var userObj = {
        uid: currentUser.uid,
        email: email,
        type: "user",
        online: true,
        userName: "Anonymous"
      };
      base.ref('users').child(currentUser.uid).set(userObj).then(function(error) {
        if (error) {
          console.error(error);
        } else {
          console.log("Account created");
          getOnlineUsers();
          alert("Account Created", '', 'Success');
        }
      });
    }, 10);
  });
}

function loginUser() {
  var email = document.querySelector('#txtEmail').value;
  var password = document.querySelector('#txtPassword').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      console.log("Login Successful");
      currentUser = auth.currentUser;
      base.ref('users').child(currentUser.uid).update({
        online: true
      }).then(function(error) {
        if (error) {
          console.error(error);
        } else {
          getOnlineUsers();
          console.log("User now online");
        }
      });
    }, function(error) {
      if (error.code === 'auth/wrong-password') {
        console.log("Wrong PassWord");
      }
      if (error.code === 'auth/user-not-found') {
        console.log("User Not Found");
      }
    });
}

function signOut() {
  base.ref('users').child(currentUser.uid).update({
    online: false
  }).then(function(error) {
    getOnlineUsers();
    if (error) {
      console.error(error);
    }
  });
  auth.signOut().then(function() {
    console.log("Signed Out");
  }).catch(function(error) {
    console.log(error);
    base.ref('users').child(currentUser.uid).update({
      online: true
    }).then(function(error) {
      if (error) {
        console.error(error);
      } else {
        // setTimeout(function(){ getOnlineUsers(); }, 1000);
        getOnlineUsers();
        console.log("User now offline");
      }
    });
  });
}

function editProfile() {
  showHide('profile', 'messaging');
  showHide('btnBackToMessage', 'btnEditProfile');
  firebase.database().ref('/users/' + currentUser.uid).once('value').then(
    function(snapshot) {
      document.getElementById('firstName').value = snapshot.val().firstName;
      document.getElementById('lastName').value = snapshot.val().lastName;
      document.getElementById('userName').value = snapshot.val().userName;
    }
  );
}

function saveProfile() {
  var user = auth.currentUser;
  var userID = user.uid;
  base.ref('users').child(userID).update({
    firstName: document.querySelector('#firstName').value,
    lastName: document.querySelector('#lastName').value,
    userName: document.querySelector('#userName').value
  }).then(
    function(error) {
      if (error) {
        console.error(error);
      } else {
        console.log("Profile Updated");
        alert("Profile updated", '', 'Success');
        showHide('messaging', 'profile');
      }
    }
  );
}

function showHide(toShow, toHide) {
  document.getElementById(toShow).classList.add('show');
  document.getElementById(toHide).classList.add('hide');
  document.getElementById(toShow).classList.remove('hide');
  document.getElementById(toHide).classList.remove('show');
}

function backToMessage() {
  showHide('btnEditProfile', 'btnBackToMessage');
  showHide('messaging', 'profile');
}

function getOnlineUsers() {
  var list = document.getElementById("onlineUsers");
  list.innerHTML = "";
  var users = base.ref("users");
  users.on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var user = childSnapshot.val();
      if (user.online && (list.innerHTML.search(user.userName) == -1)) {
        // list.innerHTML += "<li id='" + user.nodeValue + "'>" + user.userName + "</li>";
        list.innerHTML += "<li>" + user.userName + "</li>";
        console.log(user.userName);
      }
    });
  });
}
