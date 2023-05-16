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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [validDates, setValidDates] = useState<Date[]>([]);
  const [studentOnTourId, setStudentOnTourId] = useState<number>(0);

  const query: DataAdminTourQuery = router.query as DataAdminTourQuery;
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!selectedStudentId) return;

    getToursOfStudent(selectedStudentId).then((res) => {
      console.log("µµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµµ");
      console.log(res.data);
      const sots: StudentOnTour[] = res.data;
      setAllToursOfStudent(sots);
      let currentSot = sots[0];
      if (query.tour) {
        currentSot = sots.find((e) => e.tour === +[query.tour]) || sots[0];
      }
      setSelectedTourId(currentSot.tour);
      console.log("############ SOTS");
      console.log(sots);
      const validDatesArray = sots.map((sot) => new Date(sot.date));
      console.log("validDates:");
      console.log(validDatesArray);
      if (validDatesArray.length > 0) {
        const sortedDates = validDatesArray.sort((a, b) => a.getTime() - b.getTime());
        setValidDates(sortedDates);
        console.log(`sortedDates:`);
        console.log(sortedDates);
        const latestDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
        console.log(`latest date: ${latestDate}`);
        if (latestDate) {
          setSelectedDate(latestDate);
        }
      }

        
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
