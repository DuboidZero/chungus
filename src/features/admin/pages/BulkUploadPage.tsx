import { UploadCard } from '../components/UploadCard';
import { 
  uploadStudents, 
  uploadMarks, 
  uploadSkills, 
  uploadProjects, 
  uploadAchievements, 
  uploadWorkExperience 
} from '../../../api/services/admin';

export function BulkUploadPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Bulk Upload Center</h1>
        <p className="text-on-surface-variant mt-1">
          A centralized Admin-only hub for all institutional Excel (.xlsx, .csv) uploads.
        </p>
      </div>

      <div className="space-y-4">
        <UploadCard
          title="Student Import"
          description="Import new student accounts in bulk. Required columns: PRN Number, Full Name, Year of Birth, Batch, Branch, Academic Year (FY/SY/TY). Optional: Email. Format: .xlsx or .csv"
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadStudents}
        />
        
        <UploadCard
          title="Academic Marks"
          description="Import semester-wise exam results. Required columns: PRN Number, Semester Number, Subject Name, Marks Obtained, Max Marks, Credits. GPA and grades are computed server-side. Format: .xlsx or .csv"
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadMarks}
        />

        <UploadCard
          title="Skills"
          description="Bulk import student skills. Required columns: PRN Number, Skill Type (technical/soft/language), Skill Name, Proficiency (1–5 for technical/soft; Basic/Conversational/Proficient/Fluent/Native for languages). Technical skills also require: Domain. Format: .xlsx or .csv"
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadSkills}
        />

        <UploadCard
          title="Projects"
          description="Bulk import student projects. Required columns: PRN Number, Project Name, Domain, Tech Stack (comma-separated), Type (College Project/Personal Project/Internship Project), Status (Ongoing/Completed), Start Date. Optional: Description, End Date, Mentor Name. Format: .xlsx or .csv"
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadProjects}
        />

        <UploadCard
          title="Achievements"
          description="Bulk import awards and certifications. Required columns: PRN Number, Title, Category (Academic/Technical/Co-curricular/Sports/Cultural/Other), Type (Competition/Hackathon/Award/Certification/Publication/Other), Level (College/State/National/International), Date. Optional: Description, Certificate URL. Format: .xlsx or .csv"
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadAchievements}
        />

        <UploadCard
          title="Work Experience"
          description="Bulk import internships and roles. Required columns: PRN Number, Organisation Name, Role, Type (Internship/Part-time/Full-time), Start Date. Optional: End Date (leave blank if current), Description. Format: .xlsx or .csv"
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadWorkExperience}
        />
      </div>
    </div>
  );
}
