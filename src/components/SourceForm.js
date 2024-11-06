import React, { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Paper, Chip} from '@mui/material';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
//import react dropzone 
import { useDropzone } from 'react-dropzone';
//loading spinner
import CircularProgress from '@mui/material/CircularProgress';


function SourceForm() {
    const { sourceId , tab, sourceType } = useParams();
    const [autoFillLoading, setAutoFillLoading] = useState(false);
    const isEditMode = sourceId !== undefined;
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_NODE_API_URL ||'https://dashboard-api-woad.vercel.app';
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
      pdfFile: null,
    }]);
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
          pdfFile: null,

        }]);
      }
    }, [sourceId, API_BASE_URL, isEditMode]);



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
    if (e.target.name === 'keywords') {
        newSources[index][e.target.name] = e.target.value.toLowerCase().split(',').map(item => item.trim());
    } else if (e.target.type === 'file') {
        newSources[index][e.target.name] = e.target.files[0]; // Handle file input
    } else {
        newSources[index][e.target.name] = e.target.value;
    }
    setSources(newSources);
};


  const handleAutoFillPdfUrl = async (index) => {
    setAutoFillLoading(true);
    if (!sources[index].source_url) {
      console.error('No URL provided for autofill.');
      return;
    }
    try {
      console.log('Extracting metadata from URL:', sources[index].source_url);
      const response = await axios.post('https://pendiumdev.com/pipeline-no-pdf/extract_metadata_url', { url: sources[index].source_url });
      // Update the source at the specified index with the new metadata
      const updatedSources = [...sources];
      updatedSources[index] = { ...updatedSources[index], ...response.data.metadata };
      // Update the state to reflect the changes
      setSources(updatedSources);
      setAutoFillLoading(false);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      setAutoFillLoading(false);
    }
  };

  const handleAutoFillPdfFile = async (index) => {
    setAutoFillLoading(true);
    if (!sources[index].pdfFile) {
      console.error('No file selected for autofill.');
      return;
    }
    const formData = new FormData();
    formData.append("file", sources[index].pdfFile);

    try {
      const response = await fetch('https://pendiumdev.com/pipeline-no-pdf/extract_metadata_file', {
        method: 'POST',
        body: formData,
        //mode: 'no-cors'
      });
      
      console.log(response);
      const data = await response.json();
      // Update the source at the specified index with the new metadata
      const updatedSources = [...sources];
      updatedSources[index] = { ...updatedSources[index], ...data.metadata };
      // Update the state to reflect the changes
      setSources(updatedSources);
      setAutoFillLoading(false);
    } catch (error) {
      console.error('Error extracting metadata:', error);
      setAutoFillLoading(false);
    }
  };

  const Dropzone = ({ index, onDrop }) => {
    const { getRootProps, getInputProps } = useDropzone({
      onDrop: acceptedFiles => {
        const newSources = [...sources];
        if (newSources[index]) {  // Check if the source exists
          newSources[index].pdfFile = acceptedFiles[0];
          newSources[index].load_type = LoadType.PDF;
          setSources(newSources);
          onDrop(acceptedFiles[0], index);
        }
      }
    });
  
    return (
      <section>
        <div {...getRootProps()} style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center' }}>
          <input {...getInputProps()} />
          {sources[index] && sources[index].pdfFile ? (  // Check if source and pdfFile exist
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography style={{ flex: 1 }}>{sources[index].pdfFile.name}</Typography>
              <IconButton onClick={() => handleRemoveFile(index)}><CloseIcon /></IconButton>
            </div>
          ) : (
            <p>Drag 'n' drop a PDF file here, or click to select a file</p>
          )}
        </div>
      </section>
    );
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
      pdfFile: null,
    }]);
  };

  const resetForm = () => {
    setSources([{
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
      pdfFile: null,
    }]);
  };

  const handleRemoveSource = index => {
    if (sources.length === 1) {
      resetForm();
    } else {
      const newSources = [...sources];
      newSources.splice(index, 1);
      setSources(newSources);
    }
  };

  const handleRemoveFile = index => {
    const newSources = [...sources];
    newSources[index].pdfFile = null;
    setSources(newSources);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Attach source data
    formData.append('sources', JSON.stringify(sources));
  
    // If in edit mode, append additional data as needed
    if (isEditMode) {
      formData.append('sourceType', sourceType);
      formData.append('tab', tab);
      formData.append('id', sourceId);
    }
  
    // Check if there's a file to upload and append it to formData
    if (sources[0].pdfFile) {
      formData.append('pdfFile', sources[0].pdfFile);
    }
    
    const essentialFields = ['title', 'publisher', 'source_type', 'load_type', 'content_type', 'language', 'audience', 'country', 'source_url'];
    let missingFields = [];
    sources.forEach(source => {
      essentialFields.forEach(field => {
        if (!source[field] || (Array.isArray(source[field]) && source[field].length === 0)) {
          if (!missingFields.includes(field)) {
            missingFields.push(field);
          }
        }
      });
    });

    if (missingFields.length > 0) {
      toast.error(`Missing essential fields: ${missingFields.join(', ')}`);
      return;
    }
    try {
      console.log('Submitting form data:', formData);
      const url = `${API_BASE_URL}/api/master-sources/${isEditMode ? 'update' : 'store'}`;
      const method = isEditMode ? 'put' : 'post';
      const response = await axios({
        method: method,
        url: url,
        data: formData
        
      });
  
      if (response.status === 200 || response.status === 201) {
        toast.success(
          <>
            <div>Source {isEditMode ? 'update' : 'added'} status:</div>
            {response.data.sourceActionStatus.map((status, index) => (
              <div key={index}>
                <Chip label={status.status} color="success" /> {`${status.source_title} ${status.source_url}`}
              </div>
            ))}
          </>,
          { autoClose: 2000 }
        );
        if (response.data.sourceActionStatus.every(status => status.status === 'created' || status.status === 'updated')) {
          setTimeout(() => navigate("/mastersources"), 2000);
        }
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
                <Box key={index} sx={{ marginBottom: 2, backgroundColor: index % 2 === 0 ? '#fff' : '#f0f0f0' }}>
                  <Dropzone index={index} onDrop={acceptedFiles => console.log(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps()} style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                          <input {...getInputProps()} />
                          <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                      </section>
                    )}

                  </Dropzone>
                  {source.pdfFile && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleAutoFillPdfFile(index)}
                    >
                      {autoFillLoading ? <CircularProgress size={24} /> : 'Autofill from file'}
                    </Button>
                  )}
                  <TextField
                    fullWidth
                    label="Source URL"
                    name="source_url"
                    value={source.source_url}
                    onChange={(e) => handleChange(index, e)}
                    margin="normal"
                  />
                  
                  {source.source_url.includes('.') && source.source_url.length > 5 ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => handleAutoFillPdfUrl(index)}
                    >
                      {autoFillLoading ? <CircularProgress size={24} /> : 'Autofill from URL'}
                    </Button>
                  ) : null}
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
                  {!isEditMode && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', marginTop: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveSource(index)}
                        sx={{ borderColor: 'error.main', color: 'error.main', '&:hover': { borderColor: 'error.dark', backgroundColor: 'error.light' } }}
                      >
                        {index === 0 ? 'Clear' : 'Remove'}
                      </Button>
                      <Button variant="contained" color="info" onClick={handleAddSource} sx={{ backgroundColor: 'info.main', '&:hover': { backgroundColor: 'info.dark' } }}>Add Another Source</Button>

                    </Box>
                  )}
                </Box>
              ))}
            </form>
            <Button type="submit" variant="contained" color="success" onClick={handleSubmit} sx={{ backgroundColor: 'success.main', '&:hover': { backgroundColor: 'success.dark' } }}>Submit</Button>
            <Button component={Link} to="/mastersources" variant="outlined" color="secondary" sx={{ borderColor: 'secondary.main', color: 'secondary.main', '&:hover': { borderColor: 'secondary.dark', backgroundColor: 'secondary.light' } }}>Cancel</Button>
          </Paper>
        </Box>
      </div>
    </Layout>
  );
}

      
export default SourceForm;
