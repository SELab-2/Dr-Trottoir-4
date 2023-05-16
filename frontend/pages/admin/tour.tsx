import React, { useState, useEffect } from "react";

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
  const [allToursOfStudent, setAllToursOfStudent] = useState<StudentOnTour[]>(
    []
  );
  const [allStudentsOnTour, setAllStudentsOnTour] = useState<StudentOnTour[]>(
    []
  );
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allBuildingsOnTour, setAllBuildingsOnTour] = useState<
    BuildingOnTour[]
  >([]);
  const [allBuildings, setAllBuildings] = useState<BuildingInterface[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [selectedTourName, setSelectedTourName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  
  const [studentOnTourId, setStudentOnTourId] = useState<number>(0);

  const query: DataAdminTourQuery = router.query as DataAdminTourQuery;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // getAllTours().then(
      //     (res) => {
      //         const tours: Tour[] = res.data;
      //         setAllTours(tours);
      //         let currentTour = tours[0];
      //         if (query.tour) {
      //             currentTour = tours.find(e => e.id === +[query.tour]) || tours[0];
      //         }
      //         setSelectedTourId(currentTour.id);
      //         setSelectedTourName(currentTour.name);
      //     }
      // );

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

  useEffect(() => {
    if (!selectedStudentId) return;

    getToursOfStudent(selectedStudentId).then((res) => {
      console.log("µµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµ");
      console.log(res.data);
      const sot: StudentOnTour[] = res.data;
      setAllToursOfStudent(sot);
      let currentTour = sot[0];
      if (query.tour) {
        currentTour = sot.find((e) => e.tour === +[query.tour]) || sot[0];
      }
      setSelectedTourId(currentTour.tour);
    });
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedTourId) return;

    getTour(selectedTourId).then((res) => {
      const tour: Tour = res.data;
      setSelectedTour(tour);
      setSelectedTourName(tour.name);
    });
  }, [selectedTourId]);

  useEffect(() => {
    const fetchBuildingsOnTour = async () => {
      if (selectedTourId) {
        const response = await getAllBuildingsOnTourWithTourID(selectedTourId);
        setAllBuildingsOnTour(response.data);
      }
    };
    fetchBuildingsOnTour();
  }, [selectedTourId]);

  useEffect(() => {
    const fetchBuildings = async () => {
      if (allBuildingsOnTour) {
        const buildingPromises = allBuildingsOnTour.map((buildingOnTour) =>
          getBuildingInfo(buildingOnTour.building)
        );

        try {
          const buildingResponses = await Promise.all(buildingPromises);
          const fetchedBuildings = buildingResponses.map(
            (response) => response.data
          );
          setAllBuildings(fetchedBuildings);
        } catch (error) {
          console.error("Error fetching buildings:", error);
        }
      }
    };
    fetchBuildings();
  }, [allBuildingsOnTour]);

  useEffect(() => {
    console.log("allBuildings:");
    console.log(allBuildings);
    console.log(`allBuildingsOnTour:`);
    console.log(allBuildingsOnTour);
    console.log(`allStudents:`);
    console.log(allStudents);
    console.log(`allStudentsOnTour:`);
    console.log(allStudentsOnTour);
    console.log(`allToursOfStudent:`);
    console.log(allToursOfStudent);
    console.log("selectedStudent:");
    console.log(selectedStudentId);
    console.log("selected tour:");
    console.log(selectedTourId);

    if (selectedStudentId && selectedTourId) {
      const foundStudentOnTour = allStudentsOnTour.find(
        (sot) =>
          sot.student === selectedStudentId && sot.tour === selectedTourId
      );
      setStudentOnTourId(foundStudentOnTour?.id || 0);
      setLoading(false);
    }
  }, [
    selectedStudentId,
    selectedTourId,
    allStudentsOnTour,
    allBuildings,
    allBuildingsOnTour,
  ]);

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
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
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
            <p>Datum: {selectedDate}</p>
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
