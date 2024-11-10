import React, { useState, useEffect, useRef } from "react";
import { ENDPOINT } from "../../utils";
import "./ChatMessaging.css";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "./loading.json";
import { supabase } from "../../supabaseClient";

const ChatMessaging = () => {
  const userType = localStorage.getItem("userType");
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [messagesLoading, setmessagesLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null);
  const userID = localStorage.getItem("userId");
  const [chatUserID, setchatUserID] = useState(null);
  const [lcenterId, setLcenterID] = useState(null);
  const [chatRoomID, setChatRoomID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [sendBtnContent, setsendBtnContent] = useState("Yuborish");
  const lastMessageId = useRef(0);
  const receivedMessageIds = useRef(new Set());
  const messageListRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { chatName } = useParams(); // Extract chat name from the ENDPOINT
  const navigate = useNavigate();

  // Fetch user data
  const fetchLevelData = async (userID, LocaluserType) => {
    try {
      const response = await fetch(`${ENDPOINT}/workers/`);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const user = data.find(
        (user) =>
          user.workerRole.toString() === LocaluserType &&
          user.id.toString() === userID
      );

      if (user) {
        return {
          lcenterID: user.lcenterID,
        };
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching level data:", error);
      return null;
    }
  };

  // Fetch chat room ID
  const fetchChatRoomID = async () => {
    if (!chatName) return; // Ensure chatName is available
    console.log("Fetching chat room ID for:", chatName);

    try {
      const levelData = await fetchLevelData(userID, userType);
      if (!levelData) return;

      const { lcenterID } = levelData;
      setLcenterID(lcenterID);

      const response = await fetch(`${ENDPOINT}/chat-room`);
      if (!response.ok) throw new Error("Network response was not ok");

      const chatRoomData = await response.json();

      // Find the chat room based on roomName and lcenterID
      const filteredChatRoom = chatRoomData.find(
        (chatRoom) =>
          chatRoom.roomName === chatName && // Room name should match chatName
          chatRoom.lcenterID === lcenterID // lcenterID should match user's center ID
      );

      if (filteredChatRoom) {
        setChatRoomID(filteredChatRoom.id);
        console.log("Chat room ID found:", filteredChatRoom.id);
      } else {
        console.error("Chat room not found");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setLoading(true);
    }
  };

  // Fetch chat user ID
  const fetchChatUserID = async () => {
    console.log("Fetching chat user ID");

    try {
      const response = await fetch(`${ENDPOINT}/chat-user/`);
      if (!response.ok) throw new Error("Network response was not ok");

      const chatUserData = await response.json();
      setChatUsers(chatUserData);
      // Find the chat user based on userID
      const filteredChatUser = chatUserData.find(
        (chatUser) => chatUser.userID.toString() === userID.toString()
      );

      if (filteredChatUser) {
        setchatUserID(filteredChatUser.id);
        console.log("Chat user ID found:", filteredChatUser.id);
      } else {
        console.error("Chat user not found");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setLoading(true);
    }
  };

  // Fetch new messages
  const fetchNewMessages = (chatRoomId) => {
    if (!chatRoomId) return; // Ensure chatRoomId is defined
    setImagesLoaded(false);
    fetch(
      `${ENDPOINT}/get-new-messages/?last_message_id=${lastMessageId.current}&roomId=${chatRoomId}`
    )
      .then((response) => {
        if (!response.ok) {
          // Log the status if it's not 200 OK
          console.error(
            "Error fetching new messages:",
            response.status,
            response.statusText
          );
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const newMessages = data.filter(
            (message) =>
              !receivedMessageIds.current.has(message.id) &&
              Number(message.roomId) === chatRoomId
          );

          newMessages.forEach((message) => {
            receivedMessageIds.current.add(message.id);
            lastMessageId.current = Math.max(lastMessageId.current, message.id);
          });

          if (newMessages.length > 0) {
            setMessages((prevMessages) => [...prevMessages, ...newMessages]);
          }
        }
        setTimeout(() => fetchNewMessages(chatRoomId), 1000);
      })
      .catch((error) => {
        console.error("Error fetching new messages:", error);
        setTimeout(() => fetchNewMessages(chatRoomId), 5000); // Retry after 5 seconds
      })
      .finally(() => setLoading(false));
  };

  const onImageLoad = () => {
    const imageElements = document.querySelectorAll(".message-image");
    const loadedImages = Array.from(imageElements).every((img) => img.complete);

    if (loadedImages) {
      setLoading(false);
      setImagesLoaded(true);
    }
  };
  const uploadImageToSupabase = async (file) => {
    setsendBtnContent("Yuborilmoqda...");
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `chat-images/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("chats")
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicURLData } = supabase.storage
        .from("chats")
        .getPublicUrl(filePath);

      return publicURLData?.publicUrl || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const sendMessage = async () => {
    // Ensure either a text message or an image is provided
    if (!messageContent.trim() && !image) return;
    if(!image) setsendBtnContent("Yuborilmoqda...");
    let imageUrl = null;
  
    // Upload the selected image to Supabase if an image is present
    if (image) {
      imageUrl = await uploadImageToSupabase(image);
      if (!imageUrl) {
        console.error("Image upload failed.");
        return;
      }
    }
  
    // Create form data for the message
    const formData = new FormData();
    formData.append("roomId", chatRoomID);
    formData.append("content", messageContent);
    formData.append("messageOwner", chatUserID);
    if (imageUrl) formData.append("image", imageUrl);
  
    try {
      // Send the message via a POST request
      const response = await fetch(`${ENDPOINT}/chat-message/`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        // Clear the input fields and refresh messages on successful send
        setsendBtnContent("Yuborish");
        setMessageContent("");
        setImage(null);
        fetchNewMessages(); // Trigger fetching of new messages
      } else {
        console.error("Failed to send message:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  const getChatUserName = (chatUserId) => {
    const user = chatUsers.find(
      (chatUser) => chatUser.id.toString() === chatUserId.toString()
    );
    return user ? user.username : "Unknown User";
  };

  // Scroll to the bottom of the message list
  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Initial fetch for chat room ID and user ID
  useEffect(() => {
    fetchChatRoomID();
    fetchChatUserID();
  }, [chatName]);

  // Start fetching new messages when chatRoomID is set
  useEffect(() => {
    setLoading(true);
    if (chatRoomID) {
      fetchNewMessages(chatRoomID);
    }
  }, [chatRoomID]);

  // Scroll to bottom when messages are updated
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, imagesLoaded, loading]);

  const [image, setImage] = useState(null);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file); // Store the file directly
      console.log("Selected image:", file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    document.getElementById("image-picker").click();
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
  };
  const getSize = () => {
    const width = window.innerWidth;
    if (width < 600) return 100;
    if (width < 992) return 200;
    return 400; // Default size for larger screens
  };
  const getIcon = () => {
    const width = window.innerWidth;
    if (width < 600) return <i class='bx bx-send' ></i>;
    if (width < 992) return <i class='bx bx-send' ></i>;
    return sendBtnContent; // Default size for larger screens
  };
  return (
    <>
      {loading ? (
        <div className="loading-content">
          <Lottie options={defaultOptions} height={getSize()} width={getSize()} />
          <h1>Loading ...</h1>
        </div>
      ) : (
        <main className="chat-messaging">
          <div className="chat-contents">
            <div className="messages" ref={messageListRef}>
              {messages.map((message) => (
                <div
                  className={`message ${
                    message.messageOwner === chatUserID ? "sent" : "received"
                  }`}
                  key={message.id}
                >
                  <span className="username">
                    {getChatUserName(message.messageOwner)}
                  </span>
                  {message.image && (
                    <img
                      src={`${message.image}g`}
                      className="message-image"
                      onLoad={onImageLoad}
                      alt="Message attachment"
                      onContextMenu={(event) => event.preventDefault()}
                      onDragStart={(event) => event.preventDefault()}
                    />
                  )}

                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
            {image ? (
                <div className="selected-image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt=""
                    className="image-selected"
                  />
                  </div>
              ) : (
                <div></div>
              )}
            <div className="chat-input-container">
              {uploadProgress && (
                <div className="upload-progress">{`Uploading: ${uploadProgress}%`}</div>
              )}

              <input
                type="text"
                className="message-input"
                placeholder="Type a message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
              <input
                type="file"
                id="image-picker"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              {image ? (
                <div className="selected-image-preview">
                  
                  <i className="bx bxs-x-circle" onClick={removeImage}></i>
                </div>
              ) : (
                <i className="bx bx-paperclip" onClick={triggerFileInput}></i>
              )}
              <button className="send-btn" onClick={sendMessage}>
                {getIcon()}
                
              </button>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default ChatMessaging;
