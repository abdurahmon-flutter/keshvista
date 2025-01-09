import React, { useState, useEffect, useRef } from "react";
import { ENDPOINT } from "../../utils";
import "./ChatMessaging.css";
import { useParams, useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "./loading.json";
import { supabase } from "../../supabaseClient";
const ImagePreviewContainer = ({ imageUrl, message, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const handleImageLoad = () => {
    setIsLoading(false); 
  };
  

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="image-preview-container">
      {/* Background Overlay */}
      <div className="image-preview-overlay" onClick={onClose}></div>

      {/* Content */}
      <div className="image-preview-content">
        {/* Close Button */}
        <i
          className="bx bxs-x-circle close-icon"
          onClick={onClose}
          style={{ display: isLoading ? "none" : "block" }}
        ></i>

        {/* Image or Lottie Animation */}
        <div className="image-container">
          {isLoading && (
            <div className="lottie-container">
              <Lottie options={lottieOptions} height={100} width={100} />
            </div>
          )}
          <img
            src={ENDPOINT+"/media/"+imageUrl}
            alt="Preview"
            className="image-preview"
            style={{ display: isLoading ? "none" : "block" }}
            onLoad={handleImageLoad}
          />
        </div>

        {/* Download Button */}
        <a
          href={imageUrl}
          download={imageUrl}
          className="download-icon"
          style={{ display: isLoading ? "none" : "block" }}
        >
          <i className="bx bxs-download"></i>
        </a>

        {/* Message Below Image */}
        {message && <div className="image-message">{message}</div>}
      </div>
    </div>
  );
};

const ChatMessaging = () => {
  const userType = localStorage.getItem("userType");
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [messagesDeleteLoading, setMessagesDeleteLoading] = useState(false);
  const [currentData, setCurrentData] = useState();
  const [imagePreviewEnabled, setimagePreviewEnabled] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState("");
  const userID = localStorage.getItem("userId");
  const [chatUserID, setchatUserID] = useState(null);
  const [lcenterId, setLcenterID] = useState(null);
  const [chatRoomID, setChatRoomID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [selectedImageForPreview, setSelectedImageForPreview] = useState("");
  const [sendBtnContent, setsendBtnContent] = useState("Yuborish");
  const lastMessageId = useRef(0);
  const receivedMessageIds = useRef(new Set());
  const messageListRef = useRef(null);
  const [currentDeletedMessages, setCurrentDeletedMessages] = useState([]); // Array of deleted message IDs
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });
  const [userScrolling, setUserScrolling] = useState(false);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const handleImageClick = (image, message) => {
    setimagePreviewEnabled(true);
    
    setSelectedImageForPreview(image);
    console.log(`${ENDPOINT}/media/${image}`);
    setSelectedMessage(message);
  };
  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
  
      // If user scrolls up, set the flag
      if (scrollHeight - clientHeight - scrollTop > 5) {
        setUserScrolling(true);
      } else {
        setUserScrolling(false);
      }
    }
  };
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, []);
  useEffect(() => {
    if (!userScrolling) {
      scrollToBottom();
    }
  }, [messages, imagesLoaded, loading]);
  const handleSenderRightClick = (event, messageId) => {
    event.preventDefault(); // Prevent the default context menu
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      messageId: messageId,
    });
  };

  const closeImagePreview = () => {
    setimagePreviewEnabled(false);
    setSelectedImageForPreview(null);
    setSelectedMessage("");
    
  };
 
  const { chatName } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenu.visible &&
        !event.target.closest(".custom-context-menu")
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible]);
  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;
    return (
      <div
        className={`custom-context-menu ${contextMenu.visible ? "show" : ""}`}
        style={{
          position: "absolute",
          top: `${contextMenu.y-100}px`,
          left: `${contextMenu.x-100}px`,
          
          border: "1px solid #ccc",
          padding: "10px",
          zIndex: 9999,
          width:"max-content",
          backgroundColor:"var(--light)",
          color:"var(--dark)"
        }}
      >
        <ul>
          <li onClick={() => deleteMessage(contextMenu.messageId)}>
            🗑️O'chirish
          </li>
          <li>Report</li>
          {/* Add more options as needed */}
        </ul>
      </div>
    );
  };

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
      console.error(":", error);
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

  const fetchDeletedMessages = async () => {
    try {
      const response = await fetch(`${ENDPOINT}/chat-room/${chatRoomID}/clear-deleted-messages/`);
      if (response.ok) {
        const data = await response.json();
        if (data.currentDeletedMessages) {
          setCurrentDeletedMessages((prevDeletedMessages) => [
            ...prevDeletedMessages,
            ...data.currentDeletedMessages,
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching deleted messages:', error);
    }
  };
  const removeDeletedMessages = () => {
    setMessages((prevMessages) => 
      prevMessages.filter(
        (message) => !currentDeletedMessages.includes(message.id)
      )
    );
  };
  
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


  const sendMessage = async () => {
    // Ensure either a text message or an image is provided
    if (!messageContent.trim() && !image) return;
    setMessageContent("");
    setImage(null);
    setsendBtnContent("Yuborilmoqda...");
  
    // Create form data for the message
    const formData = new FormData();
    formData.append("roomId", chatRoomID);
    formData.append("content", messageContent);
    formData.append("messageOwner", chatUserID);
    if (image) formData.append("image", image); // Attach the image file if present
  
    try {
      // Send the message via a POST request
      const response = await fetch(`${ENDPOINT}/chat-message/`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        // Clear the input fields and refresh messages on successful send
        setsendBtnContent("Yuborish");
        setImage(null);
        fetchNewMessages(); // Trigger fetching of new messages
        console.log("Message sent successfully.");
      } else {
        console.error("Failed to send message:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  useEffect(() => {
    if(chatRoomID){
      // Start long polling (fetch every 5 seconds)
    const intervalId = setInterval(() => {
      fetchDeletedMessages();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    }
  }, [chatRoomID]);

  // Effect to remove deleted messages when currentDeletedMessages changes
  useEffect(() => {
    if (currentDeletedMessages.length > 0) {
      removeDeletedMessages();
    }
  }, [currentDeletedMessages]);

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
  const [image, setImage] = useState(null);
  async function deleteMessage(messageID) {
    // URL of the API endpoint
    const endpoint = `${ENDPOINT}/chat-room/${chatRoomID}/`;
  
    try {
      // Fetch the current chat room data
      const response = await fetch(endpoint);
      const chatRoom = await response.json();
  
      if (chatRoom) {
        // Check if the message ID is already in the deleted messages list
        if (!chatRoom.currentDeletedMessages.includes(messageID)) {
          // Add the message ID to the deleted messages list
          chatRoom.currentDeletedMessages.push(messageID);
  
          // Make a PUT request to update the chat room
          const updateResponse = await fetch(endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...chatRoom,
              currentDeletedMessages: chatRoom.currentDeletedMessages,
            }),
          });
  
          if (updateResponse.ok) {
            console.log(`Message ${messageID} deleted from room ${chatRoom.roomName}`);
            setContextMenu({ ...contextMenu, visible: false });
          } else {
            console.error('Failed to update chat room.');
          }
        } else {
          console.log(`Message ${messageID} is already deleted.`);
        }
      } else {
        console.log(`Chat room with ID ${chatRoomID} not found.`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  
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
    if (width < 600)
      return (
        <i class="bx bxs-send bx-rotate-270" style={{ color: "white" }}></i>
      );
    if (width < 992)
      return (
        <i class="bx bxs-send bx-rotate-270" style={{ color: "white" }}></i>
      );
    return <i class="bx bxs-send bx-rotate-270" style={{ color: "white" }}></i>; // Default size for larger screens
  };

  return (
    <>
      {loading ? (
        <div className="loading-content">
          <Lottie
            options={defaultOptions}
            height={getSize()}
            width={getSize()}
          />
          <h1>Yuklanmoqda ...</h1>
        </div>
      ) : (
        <>
          {imagePreviewEnabled ? (
            <>
              <ImagePreviewContainer
                imageUrl={selectedImageForPreview}
                message={selectedMessage}
                onClose={closeImagePreview}
              />
            </>
          ) : (
            <>
              <main className="chat-messaging">
                <div className="chat-contents">
                  <div className="messages" ref={messageListRef}>
                    {messages.map(
                      (message) =>
                        !message.deleted && (
                          <div
                          onContextMenu={(event) => message.messageOwner ===chatUserID
                            ? handleSenderRightClick(event, message.id)
                            :console.log("q0")
                          }
                            className={`message ${
                              message.messageOwner === chatUserID
                                ? "sent"
                                : "received"
                            }`}
                            key={message.id}
                          >
                            <span className="username">
                              {getChatUserName(message.messageOwner)}
                            </span>
                            {message.image && (
                              <div
                                className="message-image-container"
                                onClick={() =>
                                  handleImageClick(
                                    message.image,
                                    message.content
                                  )
                                }
                              >
                                <div className="message-image-container-inside">
                                  <i className="bx bx-image"></i>
                                  <h4>Rasm</h4>
                                  <i className="bx bx-chevron-right"></i>
                                </div>
                                <p>Ochish uchun bosing!</p>
                              </div>
                            )}
                            <div className="message-content">
                              {message.content}
                            </div>
                          </div>
                        )
                    )}
                    {renderContextMenu()}
                  </div>
                  {image ? (
                    <>
                      <div className="selected-image-preview">
                        <img
                          src={URL.createObjectURL(image)}
                          alt=""
                          className="image-selected"
                        />
                        <span>{uploadProgressText}</span>
                      </div>
                    </>
                  ) : (
                    <div></div>
                  )}

                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="message-input"
                      placeholder="Xabar..."
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
                        <i
                          className="bx bxs-x-circle"
                          onClick={removeImage}
                        ></i>
                      </div>
                    ) : (
                      <i
                        className="bx bx-paperclip"
                        onClick={triggerFileInput}
                      ></i>
                    )}
                    <button className="send-btn" onClick={sendMessage}>
                      {getIcon()}
                    </button>
                  </div>
                </div>
              </main>
            </>
          )}
        </>
      )}
    </>
  );
};

export default ChatMessaging;
