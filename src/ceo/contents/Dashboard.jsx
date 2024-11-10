import React, { useState, useEffect } from "react";
import "./dashboard.css";
import "../style.css";
import "boxicons/css/boxicons.min.css";
import Lottie from "react-lottie";
import animationData from "./loading.json";
import { ENDPOINT } from "../../utils";
import { useNavigate } from "react-router-dom";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(0);
  const [lottieSize, setlottieSize] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [clearIncome, setClearIncome] = useState(0);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestTypesList, setRequestTypesList] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [chatRoomsList, setChatRoomsList] = useState([]);
  const [chatUserID, setChatUserID] = useState(null);
  const [userName, setUserName] = useState("");
  const [image, setImage] = useState("");
  const [lcenterID, setLcenterID] = useState(null);
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");
  const userID = localStorage.getItem("userId");

  const getProviderName = (providerId) => {
    const provider = requestTypesList.find((type) => type.id === providerId);
    return provider ? provider.request_type_name : "Unknown";
  };

  
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
      fetchLevelData();
      return null;
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const levelData = await fetchLevelData(userID, userType);
        if (!levelData) return;

        const { lcenterID, workerName, workerImage } = levelData;
        setLcenterID(lcenterID); // Save lcenterID in state
        setUserName(workerName);
        setImage(workerImage);

        const responses = await Promise.all([
          fetch(`${ENDPOINT}/clients/`),
          fetch(`${ENDPOINT}/lcenterdetail/`),
          fetch(`${ENDPOINT}/courses/`),
          fetch(`${ENDPOINT}/request-to-study/`),
          fetch(`${ENDPOINT}/teachers/`),
          fetch(`${ENDPOINT}/groups/`),
          fetch(`${ENDPOINT}/lcenterincome/`),
          fetch(`${ENDPOINT}/request-types/`),
          fetch(`${ENDPOINT}/chat-room/`),
          fetch(`${ENDPOINT}/chat-user/`),
        ]);

        if (responses.some((response) => !response.ok)) {
          throw new Error("Network response was not ok");
        }

        const [
          clients,
          lcenterDetails,
          coursesData,
          requestsData,
          teachersData,
          groupsData,
          financeData,
          requestTypes,
          chatRooms,
          chatUsers,
        ] = await Promise.all(responses.map((res) => res.json()));

        const currentClient = clients.find(
          (client) => client.id.toString() === lcenterID.toString()
        );
        if (currentClient) {
          setUserName(currentClient.name);
          setImage(currentClient.image);
        }

        const currentFinance = financeData.find(
          (finance) =>
            finance.id.toString() === currentClient?.currentIncomeId?.toString()
        );

        if (currentFinance) {
          setIncome(currentFinance.income);
          setExpenses(currentFinance.expense);
          setClearIncome(currentFinance.clearIncome);
        }
        setRequestTypesList(requestTypes);
        setStudents(
          lcenterDetails.filter(
            (detail) =>
              detail.learningCenterId.toString() === lcenterID.toString()
          )
        );
        setCourses(
          coursesData.filter(
            (course) => course.lcenterID.toString() === lcenterID.toString()
          )
        );
        setRequests(
          requestsData.filter(
            (request) => request.lcenterId.toString() === lcenterID.toString()
          )
        );
        setTeachers(
          teachersData.filter(
            (teacher) =>
              teacher.learningCenterID.toString() === lcenterID.toString()
          )
        );
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
  const getSize = () => {
    const width = window.innerWidth;
    if (width < 600) return 100;
    if (width < 992) return 200;
    return 400; // Default size for larger screens
  };
  return (
    <main className="dashboard">
      {loading ? (
        <div className="loading-content">
          <Lottie options={defaultOptions} height={getSize()} width={getSize()} />
          <h1>Deyarli Tayyor ...</h1>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="header">
            <div className="left">
              <h1>{userName}</h1>
              <ul className="breadcrumb">
                <li>
                  <a href="#">Dashboard</a>
                </li>
              </ul>
            </div>
          </div>

          <ul className="insights">
            <li>
              <i className="bx bx-group"></i>
              <span className="info">
                <h3>{students.length}</h3>
                <p>O'quvchilar</p>
              </span>
            </li>
            <li>
              <i className="bx bx-show-alt"></i>
              <span className="info">
                <h3>{courses.length}</h3>
                <p>Kurslar</p>
              </span>
            </li>
            <li>
              <i className="bx bx-line-chart"></i>
              <span className="info">
                <h3>{requests.length}</h3>
                <p>So'rovlar</p>
              </span>
            </li>
            <li>
              <i className="bx bx-analyse"></i>
              <span className="info">
                <h3>{teachers.length}</h3>
                <p>O'qtuvchilar</p>
              </span>
            </li>
            <li>
              <i className="bx bx-message-square-dots"></i>
              <span className="info">
                <h3>{groups.length}</h3>
                <p>Guruhlar</p>
              </span>
            </li>
            <li>
              <i className="bx bxs-wallet-alt"></i>
              <span className="info">
                <h3>
                  {income}
                  {income > 0 ? "000" : ""}
                </h3>
                <p>Daromad</p>
              </span>
            </li>
            <li>
              <i className="bx bxs-wallet-alt"></i>
              <span className="info">
                <h3>{expenses}{expenses > 0 ? "000" : ""}</h3>
                <p>Xarajatlar</p>
              </span>
            </li>
            <li>
              <i className="bx bxs-wallet-alt"></i>
              <span className="info">
                <h3>{clearIncome}{clearIncome > 0 ? "000" : ""}</h3>
                <p>Umumiy foyda</p>
              </span>
            </li>
          </ul>

          <div className="bottom-data">
            <div className="orders">
              <div className="header">
                <i className="bx bx-receipt"></i>
                <h3>So'rovlar</h3>
                <i className="bx bx-search"></i>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>O'quvchi ismi</th>
                    <th>Telefon raqami</th>
                    <th className="provider_provider">Provayder</th>
                  </tr>
                </thead>
                <tbody>
                {[...requests]
  .sort((a, b) => b.id - a.id) // Sort by id in descending order
  .map((request) => (
    <tr key={request.id}>
      <td>
        <p>{request.name}</p>
      </td>
      <td>{request.phoneNumber}</td>
      <td className="provider_value">
        <span className="provider">
          {getProviderName(request.requestProvider)}
        </span>
      </td>
    </tr>
  ))}

                </tbody>
              </table>
            </div>

            <div className="reminders" onClick={() => navigate("/chats")}>
              <div className="header">
                <i className="bx bx-note"></i>
                <h3>Chatlar</h3>
                <i className="bx bx-search"></i>
              </div>
              <ul className="task-list">
                {chatRoomsList.map((room) => (
                  <li key={room.id}>
                    <div className="task-title">
                      <i className="bx bx-message-dots"></i>
                      <p>{room.roomName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
