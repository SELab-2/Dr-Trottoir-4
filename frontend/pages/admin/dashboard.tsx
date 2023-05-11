import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllTours, Tour } from "@/lib/tour";
import {
  getAllStudentOnTourFromDate,
  getAllStudentOnTourFromToday,
  getStudentOnTour,
  getStudentOnTourProgress,
  StudentOnTour,
} from "@/lib/student-on-tour";
import { getAllUsers, User } from "@/lib/user";
import AdminHeader from "@/components/header/adminHeader";
import { withAuthorisation } from "@/components/withAuthorisation";
import Loading from "@/components/loading";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import LiveField from "@/components/liveField";
import {
  getAllRemarksOfStudentOnTour,
} from "@/lib/remark-at-building";

interface WebSocketsResponse {
  current_building_index: number;
}

interface ProgressResponse {
  current_building_index: number;
  max_building_index?: number;
}

const GreenLinearProgress = styled(LinearProgress)(() => ({
  height: "20px",
  backgroundColor: "#c8e6c9", // Light green background color
  "& .MuiLinearProgress-bar": {
    backgroundColor: "#4caf50", // Main green progress bar color
  },
}));

function AdminDashboard() {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [studentsOnTours, setStudentsOnTours] = useState<StudentOnTour[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksRecord, setRemarksRecord] = useState<Record<string, number>>(
    {}
  );

  const [currentBuildingIndex, setCurrentBuildingIndex] = useState<
    Record<string, number>
  >({});
  const [maxBuildingIndex, setMaxBuildingIndex] = useState<
    Record<string, number>
  >({});

  const getRemarkText = (numberOfRemarks: number): string => {
    let extension = "";
    if (numberOfRemarks > 1) {
      extension = "en";
    }

    return `${numberOfRemarks} opmerking${extension}`;
  };

  const setupWebSocketForStudentOnTour = (studentOnTourId: number) => {
    const ws = new WebSocket(
      `ws://localhost:2002/ws/student-on-tour/${studentOnTourId}/`
    );

    ws.addEventListener("open", (event) => {
      console.log(
        `WebSocket connection opened for studentOnTourId: ${studentOnTourId}`
      );
    });

    ws.addEventListener("message", (event) => {
      const data: WebSocketsResponse = JSON.parse(event.data);
      console.log(data);
      setCurrentBuildingIndex((prevState) => ({
        ...prevState,
        [studentOnTourId]: data.current_building_index,
      }));
      if (!maxBuildingIndex[studentOnTourId]) {
        getStudentOnTourProgress(studentOnTourId).then(
          (res) => {
            const data: ProgressResponse = res.data;
            console.log(data);
            setMaxBuildingIndex((prevState) => ({
              ...prevState,
              [studentOnTourId]: data.max_building_index
            }));
          },
          (err) => {
            console.error(err);
          }
        );
      }
      console.log(
        `New current_building_index for ${studentOnTourId}: ${data.current_building_index}`
      );
    });

    ws.addEventListener("close", (event) => {
      console.log(
        `WebSocket connection closed for studentOnTourId: ${studentOnTourId}`
      );
    });

    ws.addEventListener("error", (event) => {
      console.error(
        `WebSocket error for studentOnTourId: ${studentOnTourId}`,
        event
      );
    });

    return ws;
  };

  const setInitialData = async (studentOnTourId: number) => {
    await fetchRemarks(studentOnTourId).then(
      (remarksCount: number) => {
        setRemarksRecord((prevState) => ({
          ...prevState,
          [studentOnTourId]: remarksCount,
        }));
      },
      (err) => {
        console.error(err);
      }
    );

    await getStudentOnTourProgress(studentOnTourId).then(
      (res) => {
        const data: ProgressResponse = res.data;
        setMaxBuildingIndex((prevState) => ({
          ...prevState,
          [studentOnTourId]: data.max_building_index
        }));

        setCurrentBuildingIndex((prevState) => ({
          ...prevState,
          [studentOnTourId]: data.current_building_index,
        }));
      },
      (err) => {
        console.error(err);
      }
    );
  };

  const fetchRemarks = async (studentOnTourId: number): Promise<number> => {
    let remarks = await getAllRemarksOfStudentOnTour(studentOnTourId, "OP");
    let remarksCount = remarks.data.length;

    return remarksCount;
  };

  const redirectToRemarksPage = async (studentOnTour: StudentOnTour) => {
    // Redirect to the specific tour page
    await router.push({
      pathname: `tour/`,
      query: {
        student: studentOnTour.student,
        tour: studentOnTour.tour,
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tourResponse = await getAllTours();
        const studentOnTourResponse = await getAllStudentOnTourFromToday();
        const allUsersResponse = await getAllUsers();

        setTours(tourResponse.data);
        setStudentsOnTours(studentOnTourResponse.data);

        setUsers(allUsersResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!studentsOnTours.length) return;

    const webSocketConnections: WebSocket[] = [];
    const newRemarks: Record<string, number> = {};
    studentsOnTours.forEach(async (studentOnTour) => {
      await setInitialData(studentOnTour.id);

      const ws = setupWebSocketForStudentOnTour(studentOnTour.id);
      webSocketConnections.push(ws);
    });

    setRemarksRecord(newRemarks);

    setLoading(false);

    return () => {
      webSocketConnections.forEach((ws) => ws.close());
    };
  }, [tours, studentsOnTours, users]);

  if (loading) {
    return (
      <>
        <AdminHeader />
        <Loading />
      </>
    );
  }
  return (
    <div>
      <AdminHeader />
      {studentsOnTours.length > 0 ? (
        <>
          <h2>Rondes van vandaag</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Ronde</th>
                <th>Student</th>
                <th>Voortgang</th>
                <th>Opmerkingen</th>
              </tr>
            </thead>
            <tbody>
              {studentsOnTours.map((studentOnTour) => {
                const tour = tours.find((t) => t.id === studentOnTour.tour);
                const user = users.find((u) => u.id === studentOnTour.student);

                if (!tour || !user) return null;

                return (
                  <tr key={studentOnTour.id}>
                    <td>{tour.name}</td>
                    <td>{`${user.first_name} ${user.last_name}`}</td>
                    <td>
                      <Box sx={{ width: "100%" }}>
                        <GreenLinearProgress
                          variant="determinate"
                          value={
                            (currentBuildingIndex[studentOnTour.id] /
                              maxBuildingIndex[studentOnTour.id]) *
                              100 || 0
                          }
                        />
                      </Box>
                    </td>

                    <td>
                      {remarksRecord[studentOnTour.id] > 0 ? (
                        <button
                          onClick={() => redirectToRemarksPage(studentOnTour)}
                        >
                          <LiveField
                            fetcher={() => fetchRemarks(studentOnTour.id)}
                            formatter={getRemarkText}
                            interval={10000}
                          />
                        </button>
                      ) : (
                        "Geen opmerkingen"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <h2>Geen rondes vandaag</h2>
      )}
    </div>
  );
}

export default withAuthorisation(AdminDashboard, ["Admin", "Superstudent"]);
