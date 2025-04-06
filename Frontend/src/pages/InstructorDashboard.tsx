import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserCourses } from '../services/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Course, Enrollment } from '../types';

const InstructorDashboard = () => {
  const { user: userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState({ total: 0, recent: 0 });
  const [loading, setLoading] = useState(true);
  const [rejectedCourses, setRejectedCourses] = useState<Course[]>([]);
  const [showRejected, setShowRejected] = useState(false);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (userData?._id && token) {
          const userCourses = await getUserCourses(userData._id, token);
          setCourses(userCourses);
          
          // Set rejected courses separately
          const rejected = userCourses.filter(course => course.approvalStatus === 'rejected');
          setRejectedCourses(rejected);

          // Calculate enrollment stats
          const totalEnrollments = userCourses.reduce((sum: number, course: Course) => sum + (course.enrollments?.length || 0), 0);
          
          // Recent enrollments (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentEnrollments = userCourses.reduce((sum: number, course: Course) => {
            const recentCount = course.enrollments?.filter((enrollment: Enrollment) => {
              const enrollmentDate = new Date(enrollment.enrollmentDate);
              return enrollmentDate >= thirtyDaysAgo;
            }).length || 0;
            return sum + recentCount;
          }, 0);
          
          setEnrollmentStats({
            total: totalEnrollments,
            recent: recentEnrollments
          });
        }
      } catch (error) {
        console.error('Error fetching instructor data:', error);
        toast.error('Failed to load instructor dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [userData]);

  return (
    <DashboardContainer>
      <h1>Instructor Dashboard</h1>
      
      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          <StatsSummary>
            <StatCard>
              <StatValue>{courses.length}</StatValue>
              <StatLabel>Total Courses</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{enrollmentStats.total}</StatValue>
              <StatLabel>Total Enrollments</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{enrollmentStats.recent}</StatValue>
              <StatLabel>Enrollments (30 days)</StatLabel>
            </StatCard>
          </StatsSummary>
          
          {/* Rejected Courses Section */}
          {rejectedCourses.length > 0 && (
            <RejectedCoursesSection>
              <SectionHeader>
                <h2>Courses Needing Attention</h2>
                <button onClick={() => setShowRejected(!showRejected)}>
                  {showRejected ? 'Hide' : 'Show'}
                </button>
              </SectionHeader>
              
              {showRejected && (
                <RejectedCoursesList>
                  {rejectedCourses.map(course => (
                    <RejectedCourseItem key={course._id}>
                      <CourseTitle>{course.title}</CourseTitle>
                      <RejectionReason>
                        <strong>Rejection Reason:</strong> {course.rejectionReason || 'No reason provided'}
                      </RejectionReason>
                      <ActionButtons>
                        <EditButton to={`/courses/${course._id}/edit`}>Edit Course</EditButton>
                      </ActionButtons>
                    </RejectedCourseItem>
                  ))}
                </RejectedCoursesList>
              )}
            </RejectedCoursesSection>
          )}
          
          <CoursesSection>
            <h2>Your Courses</h2>
            {courses.length > 0 ? (
              <CourseGrid>
                {courses.map(course => (
                  <CourseCard key={course._id}>
                    <CourseThumbnail src={course.imageUrl || '/default-course.jpg'} alt={course.title} />
                    <CourseInfo>
                      <CardTitle>{course.title}</CardTitle>
                      <StatusBadge status={course.approvalStatus || 'pending'}>
                        {course.approvalStatus || 'Pending'}
                      </StatusBadge>
                      <p>Students: {course.students?.length || 0}</p>
                      <CardActions>
                        <ViewButton to={`/courses/${course._id}`}>View</ViewButton>
                        <EditButton to={`/courses/${course._id}/edit`}>Edit</EditButton>
                      </CardActions>
                    </CourseInfo>
                  </CourseCard>
                ))}
              </CourseGrid>
            ) : (
              <NoCourses>
                <p>You haven't created any courses yet.</p>
                <CreateCourseButton to="/courses/create">Create Course</CreateCourseButton>
              </NoCourses>
            )}
          </CoursesSection>
        </>
      )}
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #3182ce;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #4a5568;
  font-size: 1rem;
`;

const RejectedCoursesSection = styled.div`
  background-color: #fff3f3;
  border: 1px solid #ffcccb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h2 {
    color: #e53e3e;
    margin: 0;
  }
  
  button {
    background-color: #e53e3e;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      background-color: #c53030;
    }
  }
`;

const RejectedCoursesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RejectedCourseItem = styled.div`
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CourseTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #2d3748;
`;

const RejectionReason = styled.p`
  color: #4a5568;
  margin: 0 0 15px 0;
  
  strong {
    color: #e53e3e;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

interface StatusProps {
  status: string;
}

const StatusBadge = styled.span<StatusProps>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${props => {
    switch(props.status) {
      case 'approved': return '#c6f6d5';
      case 'rejected': return '#fed7d7';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'approved': return '#38a169';
      case 'rejected': return '#e53e3e';
      default: return '#718096';
    }
  }};
  margin-bottom: 8px;
`;

const CoursesSection = styled.div`
  margin-top: 30px;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const CourseCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CourseThumbnail = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const CourseInfo = styled.div`
  padding: 15px;
`;

const CardTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #2d3748;
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ViewButton = styled(Link)`
  background-color: #4a5568;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
  
  &:hover {
    background-color: #2d3748;
  }
`;

const EditButton = styled(Link)`
  background-color: #3182ce;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
  
  &:hover {
    background-color: #2c5282;
  }
`;

const NoCourses = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CreateCourseButton = styled(Link)`
  display: inline-block;
  background-color: #3182ce;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  margin-top: 15px;
  
  &:hover {
    background-color: #2c5282;
  }
`;

export default InstructorDashboard; 