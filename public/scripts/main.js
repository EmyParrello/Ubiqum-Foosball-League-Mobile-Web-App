var app = new Vue({
    el: "#app",

    data: {
        data: {},
        page: "home",
        selectedTeam: [],
        no_games: false,
        loggedIn: false
    },

    methods: {
        getData: function () {
            fetch("https://api.jsonbin.io/b/5bf2e01de8376b677fc85d3e")
                .then(function (data) {
                    return data.json();
                })
                .then(function (myData) {
                    console.log(myData);
                    app.data = myData;

                    app.rankingOrder();
                })
        },

        show: function (pageName) {
            this.page = pageName;
        },

        login: function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(
                    this.loggedIn = true)
                    console.log("logged in")
        },

        logout: function () {
            firebase.auth().signOut()
            .then(
            this.loggedIn = false)
            console.log("logged out");
        },

        sendMessage: function () {
            var textInput = document.getElementById("textInput").value;
            var name = firebase.auth().currentUser.displayName;
            var photo = firebase.auth().currentUser.photoURL;
            var message = {
                avatar: photo,
                username: name,
                textMessage: textInput
            }

            // Get a key (myChat is an object) for a new message.
            firebase.database().ref("myChat").push(message);
            document.getElementById("textInput").value = "";

            console.log("message sent");
            this.scrollToBottom();
            this.postMessage();
        },

        postMessage: function () {
            firebase.database().ref('myChat').on('value', function (data) {
                var chat = document.getElementById("chat");
                chat.innerHTML = "";

                var messages = data.val();

                for (var key in messages) {
                    // message box & message content
                    var textBox = document.createElement("div");
                    var textContent = messages[key]; //each key from object "messages", that is "message" (avatar, name and textMessage)
                    var imageURL = textContent.avatar;

                    // user image & CSS class
                    var userImg = document.createElement("img");
                    userImg.setAttribute("src", imageURL);
                    userImg.setAttribute("class", "userImg");

                    // username, message & CSS classes
                    var userMsg = document.createElement("p");
                    userMsg.setAttribute("class", "chatMsg");
                    var textBold = document.createElement("span");
                    textBold.setAttribute("class", "bold");

                    var dots = ": ";
                    textBold.append(textContent.username, dots);
                    userMsg.append(textBold, textContent.textMessage);

                    // message layout & CSS classes
                    if (textContent.username == firebase.auth().currentUser.displayName) {
                        textBox.setAttribute("class", "currentUser");
                        textBox.append(userMsg, userImg);
                    } else {
                        textBox.setAttribute("class", "otherUser")
                        textBox.append(userImg, userMsg);
                    }

                    chat.append(textBox);
                }

            })
            this.scrollToBottom();
            console.log("showing messages");

        },

        scrollToBottom: function () {
            var chat = document.getElementById("chat");
            chat.scrollTop = chat.scrollHeight;
        },

        nextMatches: function () {
            var nextInfo = this.data.next_games[0];
            for (var key in nextInfo) {
                if (nextInfo[key] == "") {
                    this.no_games = true;
                }
            }
        },

        saveTeam: function (team) {            
                this.selectedTeam = [];
                this.selectedTeam.push(team);
        },

        rankingOrder: function () {
            var rankingTeams = this.data.teams;
            rankingTeams.sort(function (a, b) {
                return b.wins - a.wins
            });
        }
    },

    created() {
        this.getData();
        this.postMessage();
    },

    updated() {
        this.scrollToBottom();
    }

})
