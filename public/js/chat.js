const socket = io()
const $messageForm = document.querySelector('#formData')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
const autoscroll = ()=>{
//new msg elemnt
const $newMessage = $messages.lastElementChild

//height of new msg
const newMessageStyles = getComputedStyle($newMessage)
const newMessageMargin = parseInt(newMessageStyles.marginBottom)
const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

//Visible height
const visibleHeight = $messages.offsetHeight

//Height of messages container
const containerHeight = $messages.scrollHeight

//How far have I scrolled
const scrollOffset = $messages.scrollTop + visibleHeight

if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
}
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        loc: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
const html = Mustache.render(sidebarTemplate, {
    room,
    users
})
document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const msg = e.target.elements.message.value
    socket.emit('submitForm', msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message was delivered!')

    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', { username, room }, (error)=>{
if(error){
    alert(error)
    location.href = '/'
}
})

