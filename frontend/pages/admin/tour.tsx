import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import { getAllTours, getTour, Tour } from "@/lib/tour";
import {
  getAllStudentOnTourFromDate,
  getAllStudentOnTourFromToday,
  getToursOfStudent,
  StudentOnTour,
} from "@/lib/student-on-tour";
import { getAllUsers, getStudents, User, userSearchString } from "@/lib/user";
import {
  BuildingOnTour,
  getAllBuildingsOnTourWithTourID,
} from "@/lib/building-on-tour";
import TourAutocomplete from "@/components/autocompleteComponents/tourAutocomplete";
import StudentAutocomplete from "@/components/autocompleteComponents/studentAutocomplete";
import { BuildingInterface, getBuildingInfo } from "@/lib/building";
import { withAuthorisation } from "@/components/withAuthorisation";
import { useRouter } from "next/router";
import AdminHeader from "@/components/header/adminHeader";
import Loading from "@/components/loading";
import StudentOnTourAutocomplete from "@/components/autocompleteComponents/studentOnTourAutocomplete";

interface ParsedUrlQuery {}

interface DataAdminTourQuery extends ParsedUrlQuery {
  student?: number;
  tour?: number;
}

function AdminTour() {
  const router = useRouter();
  const [allToursOfStudent, setAllToursOfStudent] = useState<StudentOnTour[]>([]);
  const [allStudentsOnTour, setAllStudentsOnTour] = useState<StudentOnTour[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allBuildingsOnTour, setAllBuildingsOnTour] = useState<BuildingOnTour[]>([]);
  const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [selectedTourName, setSelectedTourName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [validDates, setValidDates] = useState<Date[]>([]);
  const [studentOnTourId, setStudentOnTourId] = useState<number>(0);

  const query: DataAdminTourQuery = router.query as DataAdminTourQuery;
  const [loading, setLoading] = useState(true);

  // First, fetch all students when the router is ready.
  // Set the selected student ID based on the router query or default to the first student.
  useEffect(() => {
    try {
      getStudents().then((res) => {
        const students: User[] = res.data;
        students.filter((e) => e.role === 4);
        setAllStudents(students);
        let currentStudent = students[0];
        if (query.student) {
          currentStudent =
            students.find((e) => e.id === +[query.student]) || students[0];
        }
        setSelectedStudentId(currentStudent.id);
        setSelectedStudentName(userSearchString(currentStudent));
      });
    } catch (error) {
      console.error(error);
    }
  }, [router.isReady]);


  // When selected student ID changes, fetch all tours of that student.
  // Set the selected tour ID based on the router query or default to the first tour.
  useEffect(() => {
    if (!selectedStudentId) return;

    getToursOfStudent(selectedStudentId).then((res) => {
      const sots: StudentOnTour[] = res.data;
      setAllToursOfStudent(sots);
      let currentSot = sots[0];
      if (query.tour) {
        currentSot = sots.find((e) => e.tour === +[query.tour]) || sots[0];
      }
      setSelectedTourId(currentSot.tour);


      const validDatesArray = sots.map((sot) => new Date(sot.date));
      if (validDatesArray.length > 0) {
        const sortedDates = validDatesArray.sort((a, b) => a.getTime() - b.getTime());
        setValidDates(sortedDates);
        const latestDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
        if (latestDate) {
          setSelectedDate(latestDate);
        }
      }

        
    });
  }, [selectedStudentId]);


  // When selected tour ID changes, fetch details of the tour and update selected tour.
  // Also fetch all buildings on that tour.
  useEffect(() => {
    if (!selectedTourId) return;

    getTour(selectedTourId).then((res) => {
      const tour: Tour = res.data;
      setSelectedTour(tour);
      setSelectedTourName(tour.name);
    }).catch(console.error);

    getAllBuildingsOnTourWithTourID(selectedTourId).then((res) => {
        setAllBuildingsOnTour(res.data);
    }).catch(console.error);
  }, [selectedTourId]);


  // When the list of buildings on tour changes, fetch all building details.
  useEffect(() => {
    if (!allBuildingsOnTour.length) return;

    Promise.all(allBuildingsOnTour.map((buildingOnTour) => getBuildingInfo(buildingOnTour.building)))
      .then((responses) => {
        setAllBuildings(responses.map(response =>response.data));
        setLoading(false);
        }).catch(console.error);
    }, [allBuildingsOnTour]);

    // When valid dates change, update the selected date to the latest valid date.
    // Only if the current selected date is not valid.
    useEffect(() => {
        if (validDates.length > 0) {
            const isDateValid = validDates.map(d => d.toLocaleDateString()).includes(selectedDate.toLocaleDateString());
            if (!isDateValid) {
                setSelectedDate(validDates[validDates.length - 1]);
            }
        }
    }, [validDates, selectedDate]);

//     const fetchBuildings = async () => {
//       if (allBuildingsOnTour) {
//         const buildingPromises = allBuildingsOnTour.map((buildingOnTour) =>
//           getBuildingInfo(buildingOnTour.building)
//         );

//         try {
//           const buildingResponses = await Promise.all(buildingPromises);
//           const fetchedBuildings = buildingResponses.map(
//             (response) => response.data
//           );
//           setAllBuildings(fetchedBuildings);
//         } catch (error) {
//           console.error("Error fetching buildings:", error);
//         }
//       }
//     };
//     fetchBuildings();
//   }, [allBuildingsOnTour]);

//   useEffect(() => {
//     console.log("allBuildings:");
//     console.log(allBuildings);
//     console.log(`allBuildingsOnTour:`);
//     console.log(allBuildingsOnTour);
//     console.log(`allStudents:`);
//     console.log(allStudents);
//     console.log(`allStudentsOnTour:`);
//     console.log(allStudentsOnTour);
//     console.log(`allToursOfStudent:`);
//     console.log(allToursOfStudent);
//     console.log("selectedStudent:");
//     console.log(selectedStudentId);
//     console.log("selected tour:");
//     console.log(selectedTourId);
//     console.log("selected date:");
//     console.log(selectedDate);

//     // if (selectedStudentId && selectedTourId) {
//     //   const foundStudentOnTour = allStudentsOnTour.find(
//     //     (sot) =>
//     //       sot.student === selectedStudentId && sot.tour === selectedTourId
//     //   );
//     //   setStudentOnTourId(foundStudentOnTour?.id || 0);
//     //   setLoading(false);
//     // }
//   }, [
//     selectedStudentId,
//     selectedTourId,
//     allStudentsOnTour,
//     allBuildings,
//     allBuildingsOnTour,
//   ]);

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
      <div>
        <StudentAutocomplete
          initialId={selectedStudentId}
          setObjectId={setSelectedStudentId}
          required={true}
        />
        <StudentOnTourAutocomplete
          initialId={selectedTourId}
          setObjectId={setSelectedTourId}
          required={true}
          studentId={selectedStudentId}
        />
        <ReactDatePicker
        selected={selectedDate}
        onChange={(date: Date) => setSelectedDate(date)}
        highlightDates={validDates} // highlight valid dates
        filterDate={(date: Date) => validDates.map(d => d.toLocaleDateString()).includes(date.toLocaleDateString())}
        />
      </div>
      {studentOnTourId && (
        <div style={{ display: "flex" }}>
          <div style={{ width: "20%" }}>
            <h2>Tour Details</h2>
            {/* Display the tour details */}
            <p>Tour Name: {selectedTourName}</p>
            <p>Student Name: {selectedStudentName}</p>
            {/* Add any other relevant information */}
          </div>

          <div style={{ width: "80%" }}>
            <h2>Building Details</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Building</th>
                  <th>Status</th>
                  <th>Time of Completion</th>
                  <th>Total Time</th>
                  <th>Remarks (yes/no)</th>
                  <th>All Pictures Are Present (yes/no)</th>
                </tr>
              </thead>
              <tbody>
                {allBuildings.map((building) => {
                  // Populate the table with the building details
                  // Replace the placeholders with actual data from your backend
                  return (
                    <tr key={building.id}>
                      <td>{building.name}</td>
                      <td>Afgewerkt</td>
                      <td>18h55</td>
                      <td>8m23s</td>
                      <td>{building.id ? "yes" : "no"}</td>
                      <td>{building.id ? "yes" : "no"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthorisation(AdminTour, ["Admin", "Superstudent"]);
