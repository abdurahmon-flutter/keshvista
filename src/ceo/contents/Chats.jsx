import React, { useEffect, useState} from 'react';
import './chats.css'; // Import your CSS styles
import "boxicons/css/boxicons.min.css";
import Lottie from "react-lottie";
import { ENDPOINT } from '../../utils';
import { useNavigate } from 'react-router-dom';
import animationData from "./loading.json";
const Chats = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const userID = localStorage.getItem("userId");
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [chatRoomsList, setChatRoomsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [chatUserID, setChatUserID] = useState(null);
  const [image, setImage] = useState("");
  const [lcenterID, setLcenterID] = useState(null);

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
          workerName: user.workerName,
          workerImage: user.workerImage,
        };
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching level data:", error);
      return null;
    }
  };
  const getSize = () => {
    const width = window.innerWidth;
    if (width < 600) return 100;
    if (width < 992) return 200;
    return 400; // Default size for larger screens
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const levelData = await fetchLevelData(userID, userType);
        if (!levelData) return;

        const { lcenterID, workerName, workerImage } = levelData;
        setLcenterID(lcenterID);
        setUserName(workerName);
        setImage(workerImage);

        const responses = await Promise.all([
          fetch(`${ENDPOINT}/teachers/`),
          fetch(`${ENDPOINT}/groups/`),
          fetch(`${ENDPOINT}/chat-room/`),
          fetch(`${ENDPOINT}/chat-user/`),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Network response was not ok");
        }
        

        const [
          teachersData,
          groupsData,
          chatRooms,
          chatUsers,
        ] = await Promise.all(responses.map((res) => res.json()));
        
        setTeachers(
          teachersData.filter(
            (teacher) =>
              teacher.learningCenterID
            .toString() === lcenterID.toString()
              
          )
        );
        console.log(teachers);
        setGroups(
          groupsData.filter(
            (group) => group.lcenterID.toString() === lcenterID.toString()
          )
        );

        const chatUser = chatUsers.find(
          (user) => user.userID.toString() === userID
        );
        if (chatUser) {
          setChatUserID(chatUser.id);
          const filteredRooms = chatRooms.filter((room) =>
            room.roomUsers.includes(chatUser.id)
          );
          setChatRoomsList(filteredRooms);
        }
        setLoading(false);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userID, userType]);
  
  const handleChatClick = (item) => {
    navigate(`/chats/${item.roomName}`);
  };
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  if (loading) return (
    <div className="loading-content">
          <Lottie options={defaultOptions} height={getSize()} width={getSize()} />
          <h1>Deyarli Tayyor ...</h1>
        </div>
  );

  return (
    <main id="chat">
      <div className="chat-content">
        <div className="bottom-data">
          <div className="chats_list">
            <div className="header">
              <i className="bx bx-note"></i>
              <h3>Chatlar</h3>
            </div>
            <ul className="chat-list_rows">
              {chatRoomsList.map((item) => {
                const group = groups.find((g) => g.chatId === item.id);
                const teacher = group ? teachers.find((t) => t.id === group.teacherID) : null;
                const teacherName = teacher ? teacher.teacherName : 'N/A';
                return (
                  <li key={item.id} className="completed" onClick={() => handleChatClick(item)}>
                    <div className="task-title">
                      <i className="bx bx-message-square-dots"></i>
                      <p>{item.roomName}</p>
                    </div>
                    <i className="bx bx-dots-vertical-rounded"></i>
                    <p className="info_text">
                      Guruh: {group?.groupName || 'N/A'}; Ustoz: {teacherName}; 
                      Guruh a'zolari soni: {item.roomUsers.length}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Chats;
