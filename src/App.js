import React, { useRef, useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'
import axios from './common/axios'

function App() {
  const nameRef = useRef(null)
  const textareaRef = useRef(null)
  const [list, setList] = useState([])
  const [user, setUser] = useState({})
  const [chatlist, setChatlist] = useState([])
  const [currentUser, setCurrentUser] = useState({})
  const socketRef = useRef()

  useEffect(() => {
    getUserInfo()
  }, [])
  // 方法2 每次重新监听，或者在依赖里加 chatlist 会不会好点？
  // 方法3 使用 ref 来保存 chatlist
  // useEffect(() => {
  //   if (socketRef.current) {
  //     socketRef.current.on('msg', handleMsg);
  //   }
  //   return () => {
  //     socketRef.current.off('msg');
  //   }
  // })
  const getUserInfo = () => {
    axios
      .get('/userInfo')
      .then(res => {
        setUser(res.data)
        getList()
        initSocket()
      })
      .catch(err => {
        alert('先加入')
      })
  }
  const handleMsg = data => {
    console.log('handle', chatlist, user, currentUser)
    // 上面都为空，因为绑定的时候都是初始化的时候，socket没有每次都更新
    setChatlist(chatlist => [...chatlist, data])
    // setChatlist(chatlist.concat(data))
  }
  const initSocket = () => {
    const socket = io('http://127.0.0.1:7002/')
    socket.on('connect', () => {
      const id = socket.id
      console.log('socket id:', id)
      socket.on('res', data => {
        console.log('res:', data)
      })
      socket.on('msg', handleMsg)
      socket.emit('join')
    })
    socket.on('disconnect', data => {
      console.log('disconnect:', data)
    })
    socketRef.current = socket
  }
  const join = () => {
    axios
      .post('/join', {
        name: nameRef.current.value,
      })
      .then(res => {
        setUser(res.data)
        getList()
        initSocket()
      })
  }
  const getList = () => {
    axios.get('/list').then(res => {
      setList(res.data)
    })
  }
  const chatWith = user => {
    setCurrentUser(user)
  }
  const send = () => {
    if (!currentUser._id) {
      alert('选择用户')
      return
    }
    const msg = textareaRef.current.value
    socketRef.current.emit('message', {
      userId: currentUser._id,
      msg,
    })
    setChatlist(
      chatlist.concat({
        name: user.name,
        _id: user._id,
        msg,
      })
    )
  }
  return (
    <div className="App">
      <input ref={nameRef} />
      <button onClick={join}>加入</button>
      <div className="chat">
        <div className="left">
          {list.length
            ? list.map(item => (
                <div
                  key={item._id}
                  className={currentUser._id === item._id ? 'active' : ''}
                  onClick={() => chatWith(item)}>
                  {item.name}
                </div>
              ))
            : null}
          <button onClick={getList}>刷新</button>
        </div>
        <div className="right">
          <div className="chat-area">
            {chatlist.length ? chatlist.map(item => <div>{item.name + ':' + item.msg}</div>) : null}
          </div>
          <div className="input-area">
            <textarea ref={textareaRef}></textarea>
            <button onClick={send}>发送</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
