'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles/Loader.module.css';
import { Alumni } from './types/alumni';
import { Filters } from './types/filters';
import Image from 'next/image';
import { Statistics } from './components/Statistics';

const parseYearMonth = (date: string) => {
  if (!date || typeof date !== 'string') return null;
  try {
    // Handle YYYY.MM format
    if (date.includes('.')) {
      const [year, month] = date.split('.').map(Number);
      if (!isNaN(year) && !isNaN(month)) {
        return new Date(year, month - 1);
      }
    }
    // Handle YYYY format
    const year = parseInt(date);
    if (!isNaN(year)) {
      return new Date(year, 11); // December of the year
    }
    return null;
  } catch {
    return null;
  }
};

const INSTITUTIONS = [
  'pune institute of computer technology',
  'savitribai phule pune university',
  'pict',
  'sppu',
  'university of pune' // older name of SPPU
];

const isAlumni = (person: Alumni) => {
  const currentDate = new Date();
  
  // Check both education fields
  const education1 = person.education_1?.toLowerCase() || '';
  const education2 = person.education_2?.toLowerCase() || '';
  
  const isFromInstitution = INSTITUTIONS.some(inst => 
    education1.includes(inst) || education2.includes(inst)
  );

  if (isFromInstitution) {
    let isAlum = false;
    
    // Function to check graduation status
    const checkGraduationStatus = (endDate: string | null, startDate: string | null) => {
      // If both dates exist and are the same, use start date
      if (endDate && startDate && endDate === startDate) {
        const parsedStartDate = parseYearMonth(startDate);
        if (parsedStartDate) {
          const calculatedEndDate = new Date(parsedStartDate.getFullYear() + 4, parsedStartDate.getMonth());
          return calculatedEndDate < currentDate;
        }
      }

      // Normal end date check
      if (endDate) {
        const parsedEndDate = parseYearMonth(endDate);
        if (parsedEndDate) {
          return parsedEndDate < currentDate;
        }
      }
      
      // Start date check as fallback
      if (startDate) {
        const parsedStartDate = parseYearMonth(startDate);
        if (parsedStartDate) {
          const calculatedEndDate = new Date(parsedStartDate.getFullYear() + 4, parsedStartDate.getMonth());
          return calculatedEndDate < currentDate;
        }
      }
      
      return false;
    };

    // Check education_1
    if (education1.includes('pict') || education1.includes('pune institute')) {
      isAlum = checkGraduationStatus(person.education_end_1, person.education_start_1);
    }

    // Check education_2 if education_1 didn't confirm alumni status
    if (!isAlum && (education2.includes('pict') || education2.includes('pune institute'))) {
      isAlum = checkGraduationStatus(person.education_end_2, person.education_start_2);
    }

    return isAlum;
  }

  return false;
};

const ENGINEERING_TERMS = {
  'computer': [
    'computer', 'cs', 'cse', 'comp', 'computers', 'computer science',
    'computer engineering', 'computer software', 'computer technology',
    'computer simulation', 'computer systems', 'comp sci',
    'computer & information', 'computer sci', 'compuer science'
  ],
  'it': [
    'information technology', 'it', 'informatiom technology',
    'information technologies', 'i.t.'
  ],
  'entc': [
    'electronics', 'telecommunication', 'entc', 'e&tc', 'e &tc',
    'electronics and telecommunication', 'electronic and telecommunication',
    'electronics & telecommunication', 'electronics and communications',
    'electrical, electronics and communications', 'electronics and telecommunications',
    'electronic and computer', 'vlsi'
  ],
  'management': [
    'business', 'management', 'mba', 'finance', 'marketing', 'operations',
    'business administration', 'business analytics', 'business management'
  ]
};

const filterAlumni = (alumni: Alumni[], filters: Filters) => {
  return alumni.filter(alum => {
    // Global search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        alum.full_name,
        alum.current_company,
        alum.current_company_position,
        alum.education_1,
        alum.education_2,
        alum.education_degree_1,
        alum.education_degree_2,
        alum.education_fos_1,
        alum.education_fos_2,
        alum.location_name,
        alum.headline,
        alum.skills
      ].map(field => field?.toLowerCase() || '');

      if (!searchableFields.some(field => field.includes(searchTerm))) {
        return false;
      }
    }

    // Company filter
    if (filters.company && !alum.current_company?.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }

    // Role filter
    if (filters.role && !alum.current_company_position?.toLowerCase().includes(filters.role.toLowerCase())) {
      return false;
    }

    // Field of Study filter
    if (filters.fieldOfStudy) {
      const keywords = ENGINEERING_TERMS[filters.fieldOfStudy as keyof typeof ENGINEERING_TERMS] || [];
      const degree1 = (alum.education_degree_1?.toLowerCase() || '') + ' ' + 
                     (alum.education_fos_1?.toLowerCase() || '');
      const degree2 = (alum.education_degree_2?.toLowerCase() || '') + ' ' + 
                     (alum.education_fos_2?.toLowerCase() || '');
      
      const matchesField = keywords.some(keyword => 
        degree1.includes(keyword) || degree2.includes(keyword)
      );
      
      if (!matchesField) {
        return false;
      }
    }

    // Further Studies filter
    if (filters.furtherStudies !== undefined) {
      const education2 = alum.education_2?.toLowerCase() || '';
      const isDoingFurtherStudies = INSTITUTIONS.some(inst => 
        education2.includes(inst.toLowerCase())
      );
      return filters.furtherStudies === isDoingFurtherStudies;
    }

    return true;
  });
};

export default function Home() {
  const [alumniData, setAlumniData] = useState<Alumni[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [filteredData, setFilteredData] = useState<Alumni[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/scrap');
        const alumni = data.data.filter(isAlumni);
        setAlumniData(alumni);
        setFilteredData(alumni);
      } catch (error) {
        console.log(error);
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredData(filterAlumni(alumniData, filters));
  }, [filters, alumniData]);

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-slate-200">
      <div className="flex items-center justify-center gap-4 mb-8">
        <Image
          src="/pict_logo.png"
          alt="PICT Logo"
          width={60}
          height={60}
          className="object-contain"
        />
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Alumni Directory
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className={styles.loader}></div>
          <p className="mt-4 text-xl text-gray-600">Fetching alumni data...</p>
        </div>
      ) : (
        <>
          {/* Search Field */}
          <div className="mb-6 max-w-2xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, company, skills, location..."
                className="w-full pl-10 pr-4 py-3 border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 transition-all"
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Statistics Section */}
          <Statistics data={alumniData} />

          {/* Filter Section */}
          <div className="mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Company filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Filter by company..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80"
                  onChange={(e) => handleFilterChange('company', e.target.value)}
                />
              </div>
              
              {/* Role filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Filter by role..."
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/80"
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                />
              </div>

              {/* Select inputs */}
              <select 
                className="pl-4 pr-8 py-2 border-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer bg-white/80"
                onChange={(e) => handleFilterChange('fieldOfStudy', e.target.value)}
              >
                <option value="">Field of Study</option>
                <option value="computer">Computer Engineering</option>
                <option value="it">Information Technology</option>
                <option value="entc">Electronics and Telecommunication</option>
              </select>
              <select 
                className="pl-4 pr-8 py-2 border-2 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer bg-white/80"
                onChange={(e) => handleFilterChange('furtherStudies', e.target.value === 'yes')}
              >
                <option value="">Further Studies</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-center text-gray-800 mb-8 font-medium">
            Found {filteredData.length} alumni
          </p>

          {/* Alumni Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((alumni: Alumni, index: number) => (
              <div key={index} 
                   className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 relative rounded-full overflow-hidden bg-gray-200">
                    {alumni.avatar ? (
                      <Image
                        src={alumni.avatar}
                        alt={alumni.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                        {alumni.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">{alumni.full_name}</h2>
                    <p className="text-gray-600">{alumni.headline}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{alumni.current_company_position} at {alumni.current_company}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="flex flex-col">
                      <span>{alumni.education_1} - {alumni.education_degree_1}</span>
                      {alumni.education_2 && (
                        <span className="text-sm text-gray-500">
                          {alumni.education_2} - {alumni.education_degree_2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{alumni.location_name}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  {alumni.profile_url && (
                    <a 
                      href={alumni.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin-icon lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                  )}
                  {alumni.email && (
                    <a 
                      href={`mailto:${alumni.email}`}
                      className="text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
