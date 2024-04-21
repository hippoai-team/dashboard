import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
function SourceForm() {
    const { sourceId , tab, sourceType } = useParams();
    
    const isEditMode = sourceId !== undefined;
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';

    useEffect(() => {
      if (isEditMode) {
        axios.get(`${API_BASE_URL}/api/master-sources/${sourceId}?tab=${tab}&sourceTypeFilter=${encodeURIComponent(sourceType)}`)
          .then(response => {
            setSources([response.data]);  // Ensure the response is treated as an array
          })
          .catch(error => {
            toast.error("Failed to fetch source data: " + error.message);
          });
      
      } else {
        setSources([{
          source_url: "",
          date_published: "",
          subject_specialty: "",
          title: "",
          publisher: "",
          source_type: "",
          access_status: "open_access",
          load_type: "",
          content_type: "",
          language: "",
          audience: "",
          keywords: [],
          country: "",
          status: "active",

        }]);
      }
    }, [sourceId, API_BASE_URL, isEditMode]);

  const [sources, setSources] = useState([{
    source_url: "",
    date_published: "",
    subject_specialty: "",
    title: "",
    publisher: "",
    source_type: "",
    access_status: "open_access",
    load_type: "",
    content_type: "",
    language: "",
    audience: "",
    keywords: [],
    country: "",
    status: "active",
  }]);

  const ContentType = {
    TEXT: 'text',
    TABLE: 'table',
    VIDEO: 'video',
    AUDIO: 'audio',
    IMAGE: 'image',
    SOFTWARE: 'software',
  };

  const SourceType = {
    CLINICAL_GUIDELINES: 'clinical_guidelines',
    DRUG_MONOGRAPHS: 'drug_monographs',
    REVIEW_ARTICLES: 'review_articles',
    PATIENT_EDUCATION: 'patient_education',
    FORMULARY_LISTS: 'formulary_lists',
    CASE_REPORTS: 'case_reports',
    PROCEDURES_MANUALS: 'procedures_manuals',
    RESEARCH_ARTICLES: 'research_articles',
    CLINICAL_TRIAL: 'clinical_trial',
    CONFERENCE_PROCEEDINGS: 'conference_proceedings',
    MEDICAL_TEXTBOOKS: 'medical_textbooks',
    REFERENCE_BOOKS: 'reference_books',
    MEDICAL_LECTURES: 'medical_lectures',
    MEDICAL_DATABASES: 'medical_databases',
    PATIENT_DATA: 'patient_data',
    LAB_TEST_CATALOGS: 'lab_test_catalogs',
    HEALTHCARE_POLICIES: 'healthcare_policies',
    GOVERNMENT_REPORTS: 'government_reports',
    INSURANCE_POLICIES: 'insurance_policies',
    BILLING_CODING_MANUALS: 'billing_coding_manuals',
    HOSPITAL_FEE_SCHEDULES: 'hospital_fee_schedules',
    HEALTHCARE_COST_DATABASES: 'healthcare_cost_databases',
    PBM_INFORMATION: 'pbm_information',
    MARKET_RESEARCH_REPORTS: 'market_research_reports',
    SOFTWARE_TOOL: 'software_tool',
  };

  const LoadType = {
    PDF: 'pdf',
    EPDF: 'epdf',
    WEBSITE: 'website',
    IMAGE: 'image',
    DATABASE: 'database',
    POWERPOINT: 'powerpoint',
    UNKNOWN: 'unknown',
  };

  const SubjectSpecialty = {
    FAMILY_MEDICINE: 'family_medicine',
    ADDICTIONS: 'addictions',
    ALLERGY_IMMUNOLOGY: 'allergy_immunology',
    ANDROLOGY: 'andrology',
    ANESTHESIOLOGY: 'anesthesiology',
    CARDIOLOGY: 'cardiology',
    ONCOLOGY: 'oncology',
    NEUROLOGY: 'neurology',
    PEDIATRICS: 'pediatrics',
    INFECTIOUS_DISEASES: 'infectious_diseases',
    ENDOCRINOLOGY: 'endocrinology',
    GASTROENTEROLOGY: 'gastroenterology',
    RESPIROLOGY: 'respirology',
    NEPHROLOGY: 'nephrology',
    DERMATOLOGY: 'dermatology',
    PSYCHIATRY: 'psychiatry',
    GERIATRICS: 'geriatrics',
    HEMATOLOGY: 'hematology',
    OTOLARYNGOLOGY: 'otolaryngology',
    DENISTRY: 'dentistry',
    GENERAL_MEDICINE: 'general_medicine',
    RHEUMATOLOGY: 'rheumatology',
    UROLOGY: 'urology',
    GENERAL_SURGERY: 'general_surgery',
    ORTHOPEDICS: 'orthopedics',
    OPHTHALMOLOGY: 'ophthalmology',
    OBSTETRICS_GYNECOLOGY: 'obstetrics_gynecology',
    PATHOLOGY: 'pathology',
    RADIOLOGY: 'radiology',
    EMERGENCY_MEDICINE: 'emergency_medicine',
    GENERAL_PRACTICE: 'general_practice',
    PHARMACOLOGY: 'pharmacology',
    PUBLIC_HEALTH: 'public_health',
    UNKNOWN: 'unknown',
    OCCUPATIONAL_MEDICINE: 'occupational_medicine',
    SPORTS_MEDICINE: 'sports_medicine',
    CRITICAL_CARE: 'critical_care',
    MEDICAL_GENETICS: 'medical_genetics',
    NUCLEAR_MEDICINE: 'nuclear_medicine',
    PHYSICAL_MEDICINE_REHABILITATION: 'physical_medicine_rehabilitation',
    THORACIC_SURGERY: 'thoracic_surgery',
    VASCULAR_SURGERY: 'vascular_surgery',
    PLASTIC_SURGERY: 'plastic_surgery',
    NEUROSURGERY: 'neurosurgery',
    PAIN_MEDICINE: 'pain_medicine',
    PALLIATIVE_MEDICINE: 'palliative_medicine',
    NEONATAL_PERINATAL_MEDICINE: 'neonatal_perinatal_medicine',
    RADIATION_ONCOLOGY: 'radiation_oncology',
  };

  const Audience = {
    PATIENTS: 'patients',
    HEALTHCARE_PROFESSIONALS: 'healthcare_professionals',
  };

  const handleChange = (index, e) => {
    const newSources = [...sources];
    if (e.target.name === "keywords") {
        // Split string into array by comma, trim spaces, and convert to lowercase
        newSources[index][e.target.name] = e.target.value.toLowerCase().split(',').map(item => item.trim());
    } else {
        // Convert text to lowercase before setting it in state
        newSources[index][e.target.name] = e.target.value.toLowerCase();
    }
    setSources(newSources);
};


  const handleAddSource = () => {
    setSources([...sources, {
      source_url: "",
      date_published: "",
      subject_specialty: "",
      title: "",
      publisher: "",
      source_type: "",
      access_status: "",
      load_type: "",
      content_type: "",
      language: "",
      audience: "",
      keywords: [],
      country: "",
      source_id: "",
      status: "new",
    }]);
  };

  const handleRemoveSource = index => {
    const newSources = [...sources];
    newSources.splice(index, 1);
    setSources(newSources);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/api/master-sources/${isEditMode ? 'update' : 'store'}`;
      const method = isEditMode ? 'put' : 'post';
      const payload = isEditMode ? { ...sources[0], sourceType: sourceType, tab:tab, id: sourceId } : { sources, tab, sourceType };
      const response = await axios[method](url, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(
          <>
            <div>Source successfully {isEditMode ? 'updated' : 'created'}!</div>
            {response.data.sourceActionStatus.map((status, index) => (
              <div key={index}>{`${status.source_title} ${status.source_url}: ${status.status}`}</div>
            ))}
          </>,
          { autoClose: 2000 }
        );
        setTimeout(() => navigate("/mastersources"), 2000);
      } else {
        toast.error("Failed to save source: " + response.data.error);
      }
    } catch (error) {
      toast.error("There was an error: " + (error.response?.data.error || error.message));
    }
  };

  return (
    <Layout>
      <div className="content-wrapper">
        <Box sx={{ padding: 3 }}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6">Add New Sources</Typography>
            <form onSubmit={handleSubmit}>
              {sources.map((source, index) => (
                <Box key={index} sx={{ marginBottom: 2 }}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={source.title}
                    onChange={(e) => handleChange(index, e)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Publisher"
                    name="publisher"
                    value={source.publisher}
                    onChange={(e) => handleChange(index, e)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Source URL"
                    name="source_url"
                    value={source.source_url}
                    onChange={(e) => handleChange(index, e)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Date Published (YYYY-MM-DD)"
                    name="date_published"
                    value={source.date_published}
                    onChange={(e) => handleChange(index, e)}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Subject Specialty</InputLabel>
                    <Select
                      name="subject_specialty"
                      value={source.subject_specialty}
                      onChange={(e) => handleChange(index, e)}
                    >
                        {Object.keys(SubjectSpecialty).map((key) => {
                            return <MenuItem key={key} value={SubjectSpecialty[key]}>{key}</MenuItem>

                        }
                        )}
                        
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Source Type</InputLabel>
                    <Select
                      name="source_type"
                      value={source.source_type}
                      onChange={(e) => handleChange(index, e)}
                    >
                     {Object.keys(SourceType).map((key) => {
                            return <MenuItem key={key} value={SourceType[key]}>{key}</MenuItem>

                        }
                        )}
                     
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Load Type</InputLabel>
                    <Select
                      name="load_type"
                      value={source.load_type}
                      onChange={(e) => handleChange(index, e)}
                    >
                        {Object.keys(LoadType).map((key) => {
                            return <MenuItem key={key} value={LoadType[key]}>{key}</MenuItem>

                        }
                        )}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      name="content_type"
                      value={source.content_type}
                      onChange={(e) => handleChange(index, e)}
                    >
                        {Object.keys(ContentType).map((key) => {
                            return <MenuItem key={key} value={ContentType[key]}>{key}</MenuItem>

                        }
                        )}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Audience</InputLabel>
                    <Select
                      name="audience"
                      value={source.audience}
                      onChange={(e) => handleChange(index, e)}
                    >
                      {Object.keys(Audience).map((key) => {
                            return <MenuItem key={key} value={Audience[key]}>{key}</MenuItem>

                        }
                        )}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="language-label">Language</InputLabel>
                    <Select
                      labelId="language-label"
                      name="language"
                      value={source.language}
                      onChange={(e) => handleChange(index, e)}
                      label="Language"
                    >
                      <MenuItem value="english">English</MenuItem>
                      <MenuItem value="french">French</MenuItem>
                      <MenuItem value="spanish">Spanish</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="country-label">Country</InputLabel>
                    <Select
                      labelId="country-label"
                      name="country"
                      value={source.country}
                      onChange={(e) => handleChange(index, e)}
                      label="Country"
                    >
                      <MenuItem value="united_states">United States</MenuItem>
                      <MenuItem value="canada">Canada</MenuItem>
                      <MenuItem value="costa_rica">Costa Rica</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                        fullWidth
                        label="Keywords (comma-separated)"
                        name="keywords"
                        value={source.keywords ? source.keywords.join(', ') : ''} // Join array elements into a string separated by commas, handle if keywords are undefined or null
                        onChange={(e) => handleChange(index, e)}
                        margin="normal"
                    />
                  {isEditMode ? (
                    <Box sx={{ marginTop: 2 }}>
                      <Button type="submit" variant="contained" color="primary">Submit</Button>
                      <Button component={Link} to="/sources" variant="contained" color="secondary">Cancel</Button>
                    </Box>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleRemoveSource(index)}
                      >
                        Remove
                      </Button>
                      <Button variant="contained" onClick={handleAddSource}>Add Another Source</Button>
                    </>
                  )}
                </Box>
              ))}
            </form>
          </Paper>
        </Box>
      </div>
    </Layout>
  );
}

      
export default SourceForm;
