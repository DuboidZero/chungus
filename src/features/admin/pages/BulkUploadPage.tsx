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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bulk Upload Center</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          A centralized Admin-only hub for all institutional Excel (.xlsx, .csv) uploads.
        </p>
      </div>

      <div className="space-y-4">
        <UploadCard
          title="Student Import"
          description="Columns: PRN Number (Required), Full Name (Required), Year of Birth (Required), Batch (Required), Branch (Required), Academic Year (Required), Email (Optional)."
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadStudents}
        />
        
        <UploadCard
          title="Academic Marks"
          description="Import bulk exam results and assessment marks for students."
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadMarks}
        />

        <UploadCard
          title="Skills"
          description="Bulk import technical and soft skills for students."
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadSkills}
        />

        <UploadCard
          title="Projects"
          description="Bulk import student projects. Requires student PRN, Project Name, and Type."
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadProjects}
        />

        <UploadCard
          title="Achievements"
          description="Bulk import hackathon wins, certifications, and awards."
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadAchievements}
        />

        <UploadCard
          title="Work Experience"
          description="Bulk import internships and part-time roles for students."
          acceptedFileTypes=".xlsx,.csv"
          onUpload={uploadWorkExperience}
        />
      </div>
    </div>
  );
}
