const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Official course structures from the curriculum
const OFFICIAL_COURSES = {
  'BSc. Sustainable Agriculture': {
    'Level 100': {
      'First Semester': [
        'AGM 151', 'AGM 153', 'AGM 155', 'ESM 151', 'ESM 155', 
        'GNS 151', 'GNS 153', 'GNS 155'
      ],
      'Second Semester': [
        'AGM 158', 'AGM 152', 'AGM 154', 'AGM 156', 'ANS 152', 
        'ESM 156', 'GNS 152', 'GNS 154', 'GNS 156'
      ]
    },
    'Level 200': {
      'First Semester': [
        'AGM 265', 'AGM 251', 'AGM 253', 'AGM 255', 'AGM 257', 
        'AGM 259', 'AGM 261', 'AGM 263'
      ],
      'Second Semester': [
        'AGM 258', 'AGM 260', 'AGM 252', 'AGM 254', 'AGM 256', 
        'ANS 252', 'ANS 254', 'AGM 262'
      ]
    },
    'Level 300': {
      'First Semester': [
        'AGM 355', 'AGM 351', 'AGM 353', 'ANS 351', 'ANS 353', 
        'ANS 355', 'GNS 351'
      ],
      'Second Semester': [
        'AGM 352', 'ANS 352', 'AGM 354', 'ESM 258', 'GNS 352', 
        'GNS 356', 'AGM 356', 'AGM 358'
      ]
    },
    'Level 400': {
      'First Semester': [
        'AGM 453', 'AGM 455', 'AGM 457', 'ESM 451'
      ],
      'Second Semester': [
        'AGM 452', 'AGM 454', 'AGM 456', 'AGM 458'
      ]
    }
  },
  'BSc. Environmental Science and Management': {
    'Level 100': {
      'First Semester': [
        'ESM 151', 'ESM 153', 'ESM 155', 'AGM 151', 'GNS 151', 
        'GNS 153', 'GNS 155', 'ESM 161'
      ],
      'Second Semester': [
        'ESM 152', 'ESM 154', 'ESM 156', 'AGM 152', 'ESM 158', 
        'GNS 152', 'GNS 154', 'GNS 156'
      ]
    },
    'Level 200': {
      'First Semester': [
        'ESM 251', 'ESM 253', 'ESM 255', 'ESM 257', 'ESM 259', 
        'GNS 251', 'GNS 253'
      ],
      'Second Semester': [
        'ESM 252', 'ESM 254', 'ESM 256', 'ESM 258', 'ESM 260', 
        'ESM 262', 'ESM 264'
      ]
    },
    'Level 300': {
      'First Semester': [
        'ESM 351', 'ESM 353', 'ESM 355', 'ESM 357', 'ESM 359', 
        'GNS 351'
      ],
      'Second Semester': [
        'ESM 352', 'ESM 354', 'ESM 356', 'ESM 358', 'GNS 352', 
        'ESM 360', 'ESM 362'
      ]
    },
    'Level 400': {
      'First Semester': [
        'ESM 451', 'ESM 453', 'ESM 455'
      ],
      'Second Semester': [
        'ESM 452', 'ESM 454'
      ]
    }
  }
};

// Course details mapping
const COURSE_DETAILS = {
  'AGM 151': { title: 'Introduction to Soil Science', credits: 3, level: 100, semester: 'First Semester' },
  'AGM 152': { title: 'Principles of Land Surveying', credits: 2, level: 100, semester: 'Second Semester' },
  'AGM 153': { title: 'Introductory Botany', credits: 2, level: 100, semester: 'First Semester' },
  'AGM 154': { title: 'Principles of Agroecology', credits: 1, level: 100, semester: 'Second Semester' },
  'AGM 155': { title: 'Principles of Crop Production', credits: 2, level: 100, semester: 'First Semester' },
  'AGM 156': { title: 'Vacation Training', credits: 3, level: 100, semester: 'Second Semester' },
  'AGM 158': { title: 'Introductory Economics', credits: 2, level: 100, semester: 'Second Semester' },
  'AGM 251': { title: 'Farming Systems and Natural Resources', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 252': { title: 'Arable and Plantation Crop Production', credits: 2, level: 200, semester: 'Second Semester' },
  'AGM 253': { title: 'Crop Physiology', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 254': { title: 'Soil Conservation and Fertility Management', credits: 2, level: 200, semester: 'Second Semester' },
  'AGM 255': { title: 'Introduction to Plant Pathology', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 256': { title: 'Weed Science', credits: 2, level: 200, semester: 'Second Semester' },
  'AGM 257': { title: 'Principles of Plant Breeding', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 258': { title: 'Agricultural Economics and Marketing', credits: 3, level: 200, semester: 'Second Semester' },
  'AGM 259': { title: 'Agricultural Power Sources and Mechanization', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 260': { title: 'Introduction to Agric. Extension', credits: 2, level: 200, semester: 'Second Semester' },
  'AGM 261': { title: 'Introduction to Entomology', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 262': { title: 'Fruit and Vegetable Crop Production', credits: 2, level: 200, semester: 'Second Semester' },
  'AGM 263': { title: 'Soil Microbiology', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 265': { title: 'Rural Sociology', credits: 2, level: 200, semester: 'First Semester' },
  'AGM 351': { title: 'Principles of Crop Pest Control & Disease Mgt.', credits: 2, level: 300, semester: 'First Semester' },
  'AGM 352': { title: 'Agricultural Law and Policy', credits: 2, level: 300, semester: 'Second Semester' },
  'AGM 353': { title: 'Integrated Crop Protection Management', credits: 2, level: 300, semester: 'First Semester' },
  'AGM 354': { title: 'Entrepreneurship Development', credits: 2, level: 300, semester: 'Second Semester' },
  'AGM 355': { title: 'Farm Management and Agribusiness', credits: 2, level: 300, semester: 'First Semester' },
  'AGM 356': { title: 'Amenity and Ornamental Horticulture', credits: 2, level: 300, semester: 'Second Semester' },
  'AGM 358': { title: 'Introduction to Post Harvest Science', credits: 3, level: 300, semester: 'Second Semester' },
  'AGM 452': { title: 'Environmental Pollution and Remediation', credits: 2, level: 400, semester: 'Second Semester' },
  'AGM 453': { title: 'Seminar I', credits: 1, level: 400, semester: 'First Semester' },
  'AGM 454': { title: 'Seminar II', credits: 1, level: 400, semester: 'Second Semester' },
  'AGM 455': { title: 'Research Project I', credits: 3, level: 400, semester: 'First Semester' },
  'AGM 456': { title: 'Research Project II', credits: 3, level: 400, semester: 'Second Semester' },
  'AGM 457': { title: 'Irrigation Principles and Management', credits: 3, level: 400, semester: 'First Semester' },
  'AGM 458': { title: 'Crop Root Associations', credits: 3, level: 400, semester: 'Second Semester' },
  'AGM 459': { title: 'Principles of Crop Biotechnology', credits: 3, level: 400, semester: 'First Semester' },
  'AGM 461': { title: 'Seed Production Technology', credits: 3, level: 400, semester: 'First Semester' },
  'AGM 462': { title: 'Economic Entomology', credits: 3, level: 400, semester: 'Second Semester' },
  'AGM 463': { title: 'Soil Quality', credits: 3, level: 400, semester: 'First Semester' },
  'AGM 464': { title: 'Organic Agriculture', credits: 3, level: 400, semester: 'Second Semester' },
  'AGM 465': { title: 'Fertilizer Technology and Use', credits: 3, level: 400, semester: 'First Semester' },
  
  'ANS 152': { title: 'Anatomy and Physiology of Farm Animals', credits: 3, level: 100, semester: 'Second Semester' },
  'ANS 252': { title: 'Poultry Production and Management', credits: 2, level: 200, semester: 'Second Semester' },
  'ANS 254': { title: 'Principles of Animal Nutrition', credits: 2, level: 200, semester: 'Second Semester' },
  'ANS 351': { title: 'Forage Production', credits: 2, level: 300, semester: 'First Semester' },
  'ANS 352': { title: 'Ruminant Production and Management', credits: 3, level: 300, semester: 'Second Semester' },
  'ANS 353': { title: 'Swine Production and Management', credits: 2, level: 300, semester: 'First Semester' },
  'ANS 355': { title: 'Animal Health and Diseases', credits: 2, level: 300, semester: 'First Semester' },
  'ANS 451': { title: 'Fisheries and Aquaculture', credits: 3, level: 400, semester: 'First Semester' },
  'ANS 452': { title: 'Animal Production and Climate Change', credits: 3, level: 400, semester: 'Second Semester' },
  'ANS 453': { title: 'Feed Analysis', credits: 3, level: 400, semester: 'First Semester' },
  'ANS 454': { title: 'Principles Dairy Science and Processing', credits: 3, level: 400, semester: 'Second Semester' },
  'ANS 455': { title: 'Animal Breeding and Improvement Programmes', credits: 3, level: 400, semester: 'First Semester' },
  'ANS 456': { title: 'Animal Food Sanitation and Safety', credits: 3, level: 400, semester: 'Second Semester' },
  'ANS 457': { title: 'Principles of Meat Science and Processing', credits: 3, level: 400, semester: 'First Semester' },
  'ANS 458': { title: 'Farm Animal Behaviour', credits: 3, level: 400, semester: 'Second Semester' },
  'ANS 459': { title: 'Reproductive Physiology and Artificial Insemination', credits: 3, level: 400, semester: 'First Semester' },
  'ANS 461': { title: 'Ruminant Nutrition', credits: 3, level: 400, semester: 'First Semester' },
  'ANS 462': { title: 'Monogastric Nutrition', credits: 3, level: 400, semester: 'Second Semester' },
  
  'ESM 151': { title: 'Principles of Biochemistry', credits: 3, level: 100, semester: 'First Semester' },
  'ESM 152': { title: 'Principles of Environmental Science II', credits: 2, level: 100, semester: 'Second Semester' },
  'ESM 153': { title: 'Principles of Environmental Science I', credits: 2, level: 100, semester: 'First Semester' },
  'ESM 154': { title: 'Environment and Development', credits: 2, level: 100, semester: 'Second Semester' },
  'ESM 155': { title: 'Introduction to Climatology', credits: 2, level: 100, semester: 'First Semester' },
  'ESM 156': { title: 'Basic Microbiology', credits: 3, level: 100, semester: 'Second Semester' },
  'ESM 158': { title: 'Introductory Economics', credits: 2, level: 100, semester: 'Second Semester' },
  'ESM 161': { title: 'Principles of Management', credits: 2, level: 100, semester: 'First Semester' },
  'ESM 251': { title: 'Geology', credits: 3, level: 200, semester: 'First Semester' },
  'ESM 252': { title: 'Introduction to Environmental Engineering', credits: 3, level: 200, semester: 'Second Semester' },
  'ESM 253': { title: 'Principles of Land Economy', credits: 2, level: 200, semester: 'First Semester' },
  'ESM 254': { title: 'Environment and Sustainability', credits: 2, level: 200, semester: 'Second Semester' },
  'ESM 255': { title: 'Hydrology', credits: 2, level: 200, semester: 'First Semester' },
  'ESM 256': { title: 'Agroecology', credits: 2, level: 200, semester: 'Second Semester' },
  'ESM 257': { title: 'Oceanography', credits: 3, level: 200, semester: 'First Semester' },
  'ESM 258': { title: 'Remote Sensing and GIS', credits: 3, level: 200, semester: 'Second Semester' },
  'ESM 259': { title: 'Rural Sociology', credits: 2, level: 200, semester: 'First Semester' },
  'ESM 260': { title: 'Introduction to Resource Analysis', credits: 2, level: 200, semester: 'Second Semester' },
  'ESM 262': { title: 'Introduction to Waste Management', credits: 3, level: 200, semester: 'Second Semester' },
  'ESM 264': { title: 'Introduction to Limnology', credits: 3, level: 200, semester: 'Second Semester' },
  'ESM 351': { title: 'Environmental Quality Analysis', credits: 3, level: 300, semester: 'First Semester' },
  'ESM 352': { title: 'Environmental Auditing and Assessment', credits: 3, level: 300, semester: 'Second Semester' },
  'ESM 353': { title: 'Environmental Law and Policy', credits: 2, level: 300, semester: 'First Semester' },
  'ESM 354': { title: 'Ecological and Environmental Economics', credits: 3, level: 300, semester: 'Second Semester' },
  'ESM 355': { title: 'Climate Change', credits: 2, level: 300, semester: 'First Semester' },
  'ESM 356': { title: 'Mining and Mineral Resources', credits: 2, level: 300, semester: 'Second Semester' },
  'ESM 357': { title: 'Environmental Pollution and Toxicology', credits: 2, level: 300, semester: 'First Semester' },
  'ESM 358': { title: 'Environment and Health', credits: 2, level: 300, semester: 'Second Semester' },
  'ESM 359': { title: 'Integrated Water Resources Management', credits: 3, level: 300, semester: 'First Semester' },
  'ESM 360': { title: 'Project Management', credits: 2, level: 300, semester: 'Second Semester' },
  'ESM 362': { title: 'Entrepreneurship Development', credits: 2, level: 300, semester: 'Second Semester' },
  'ESM 411': { title: 'Environmental Management', credits: 2, level: 400, semester: 'First Semester' },
  'ESM 451': { title: 'Environmental Management', credits: 2, level: 400, semester: 'First Semester' },
  'ESM 452': { title: 'Seminar II', credits: 1, level: 400, semester: 'Second Semester' },
  'ESM 453': { title: 'Seminar I', credits: 1, level: 400, semester: 'First Semester' },
  'ESM 454': { title: 'Research Project II', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 455': { title: 'Research Project I', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 456': { title: 'Collaborative Forest Management', credits: 2, level: 400, semester: 'Second Semester' },
  'ESM 457': { title: 'Forestry', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 458': { title: 'Forestry Economics and Extension Methods', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 459': { title: 'Plantation Silviculture', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 460': { title: 'Forest Measurement and Tree Improvement', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 461': { title: 'Natural Forest Silviculture', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 462': { title: 'Forest Products Harvesting', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 463': { title: 'Vegetation Analysis', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 464': { title: 'Forest Fire Management', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 465': { title: 'Agroforestry', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 466': { title: 'Forest Inventories', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 467': { title: 'Forest Products Utilization', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 468': { title: 'Wildlife Resources and Conservation', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 469': { title: 'Forest Law and Policy', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 470': { title: 'Forest Systematics', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 472': { title: 'Ethics in Mining', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 473': { title: 'Environmental Impact of Mining', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 474': { title: 'Mining and Society', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 475': { title: 'Soil Remediation', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 476': { title: 'Mining Resource Economics', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 477': { title: 'Reclamation and Remediation', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 478': { title: 'Corporate Social Responsibility', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 479': { title: 'Sustainable Mining Operations', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 480': { title: 'Occupational Safety in Mining', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 481': { title: 'Mining Law and Policy', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 482': { title: 'Modern Trends in Mining', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 483': { title: 'Energy Principles', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 484': { title: 'Renewable Energy Systems', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 485': { title: 'Electricity Demand and Management', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 486': { title: 'Energy and Environment', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 487': { title: 'Waste-to-Energy Recovery', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 488': { title: 'Energy Policy and Law', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 489': { title: 'Energy Economics', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 490': { title: 'Energy and Development', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 491': { title: 'Fossil Fuels', credits: 3, level: 400, semester: 'First Semester' },
  'ESM 492': { title: 'Energy Efficiency and Conservation', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 494': { title: 'Energy and Development', credits: 3, level: 400, semester: 'Second Semester' },
  'ESM 496': { title: 'Nuclear Energy', credits: 3, level: 400, semester: 'Second Semester' },
  
  'GNS 151': { title: 'Basic Mathematics', credits: 2, level: 100, semester: 'First Semester' },
  'GNS 152': { title: 'Basic Statistics', credits: 2, level: 100, semester: 'Second Semester' },
  'GNS 153': { title: 'Introduction to Computing I', credits: 2, level: 100, semester: 'First Semester' },
  'GNS 154': { title: 'Introduction to Computing II', credits: 2, level: 100, semester: 'Second Semester' },
  'GNS 155': { title: 'Communication Skills I', credits: 2, level: 100, semester: 'First Semester' },
  'GNS 156': { title: 'Communication Skills II', credits: 2, level: 100, semester: 'Second Semester' },
  'GNS 251': { title: 'Fundamentals of Planning', credits: 2, level: 200, semester: 'First Semester' },
  'GNS 253': { title: 'Principles of Law', credits: 2, level: 200, semester: 'First Semester' },
  'GNS 351': { title: 'Experimental Design and Analysis', credits: 3, level: 300, semester: 'First Semester' },
  'GNS 352': { title: 'Research Methodology and Techniques', credits: 2, level: 300, semester: 'Second Semester' },
  'GNS 356': { title: 'Industrial Attachment', credits: 2, level: 300, semester: 'Second Semester' },
  
  'HOR 451': { title: 'Nursery Development and Management', credits: 3, level: 400, semester: 'First Semester' },
  'HOR 452': { title: 'Horticulture Business Practices', credits: 2, level: 400, semester: 'Second Semester' },
  'HOR 453': { title: 'Sustainable Landscaping', credits: 3, level: 400, semester: 'First Semester' },
  'HOR 454': { title: 'Horticultural Food Sanitation and Safety', credits: 3, level: 400, semester: 'Second Semester' },
  'HOR 455': { title: 'Floriculture', credits: 3, level: 400, semester: 'First Semester' },
  'HOR 456': { title: 'Turf Development and Management', credits: 3, level: 400, semester: 'Second Semester' },
  'HOR 457': { title: 'Herbs, Spices and Medicinal Plants', credits: 3, level: 400, semester: 'First Semester' },
  'HOR 458': { title: 'Principles of Horticultural Therapy', credits: 3, level: 400, semester: 'Second Semester' },
  
  'AEE 451': { title: 'Food Security and Climate Change', credits: 3, level: 400, semester: 'First Semester' },
  'AEE 452': { title: 'Agricultural Finance', credits: 2, level: 400, semester: 'Second Semester' },
  'AEE 453': { title: 'Agric. Education and Communication', credits: 3, level: 400, semester: 'First Semester' },
  'AEE 454': { title: 'Agricultural Production and Consumer Behaviour', credits: 2, level: 400, semester: 'Second Semester' },
  'AEE 455': { title: 'Extension Education and Development', credits: 3, level: 400, semester: 'First Semester' },
  'AEE 456': { title: 'Project Management', credits: 3, level: 400, semester: 'Second Semester' },
  'AEE 457': { title: 'Agricultural Cooperatives', credits: 3, level: 400, semester: 'First Semester' },
  'AEE 458': { title: 'World Food Economics', credits: 2, level: 400, semester: 'Second Semester' },
  'AEE 459': { title: 'Agricultural Value Chain', credits: 3, level: 400, semester: 'First Semester' },
  
  'AQS 451': { title: 'River Ecology', credits: 3, level: 400, semester: 'First Semester' },
  'AQS 452': { title: 'Integrated Coastal Zone Management', credits: 2, level: 400, semester: 'Second Semester' },
  'AQS 453': { title: 'Aquatic Biogeochemistry', credits: 3, level: 400, semester: 'First Semester' },
  'AQS 454': { title: 'Fish Biology', credits: 3, level: 400, semester: 'Second Semester' },
  'AQS 455': { title: 'Lake and River Management', credits: 3, level: 400, semester: 'First Semester' },
  'AQS 456': { title: 'Fisheries Management', credits: 3, level: 400, semester: 'Second Semester' },
  'AQS 457': { title: 'Plankton Ecology', credits: 3, level: 400, semester: 'First Semester' },
  'AQS 458': { title: 'Marine Conservation', credits: 3, level: 400, semester: 'Second Semester' },
  'AQS 459': { title: 'Trophic Dynamics in Lakes', credits: 3, level: 400, semester: 'First Semester' },
  'AQS 461': { title: 'Wetland Ecosystems', credits: 3, level: 400, semester: 'First Semester' },
  'AQS 462': { title: 'Marine and Coastal Pollution', credits: 3, level: 400, semester: 'Second Semester' },
  'AQS 464': { title: 'Marine and Coastal Resource Economics', credits: 3, level: 400, semester: 'Second Semester' },
  'AQS 466': { title: 'Maritime Law and Policy', credits: 3, level: 400, semester: 'Second Semester' },
  
  'WEH 451': { title: 'Environmental Safety', credits: 3, level: 400, semester: 'First Semester' },
  'WEH 452': { title: 'Food Sanitation and Safety', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 453': { title: 'Introduction to Public Health & Epidemiology', credits: 3, level: 400, semester: 'First Semester' },
  'WEH 454': { title: 'Public Health and Diseases Management', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 455': { title: 'Integrated Solid Waste Management', credits: 3, level: 400, semester: 'First Semester' },
  'WEH 456': { title: 'Agricultural and Industrial Waste Management', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 457': { title: 'Waste-to-Energy Recovery', credits: 3, level: 400, semester: 'First Semester' },
  'WEH 458': { title: 'Agricultural and Industrial Waste Management', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 459': { title: 'Rural and Urban Sanitation', credits: 3, level: 400, semester: 'First Semester' },
  'WEH 460': { title: 'Vector Management and Control', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 461': { title: 'Water Supply and Wastewater Management', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 462': { title: 'Compost Science and Technology', credits: 3, level: 400, semester: 'Second Semester' },
  'WEH 463': { title: 'Landfill Operations and Management', credits: 3, level: 400, semester: 'First Semester' },
  'WEH 471': { title: 'Environmental Microbiology', credits: 3, level: 400, semester: 'First Semester' }
};

async function cleanupAndAlignCourses() {
  try {
    console.log('🧹 Starting comprehensive course cleanup and alignment...');
    
    // Initialize Firebase Admin
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Service account file not found');
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Initialize app if not already done
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com"
      });
    }
    
    const db = admin.firestore();
    
    // Step 1: Get all existing courses
    console.log('📚 Fetching all existing courses...');
    const coursesSnapshot = await db.collection('academic-courses').get();
    const existingCourses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Total existing courses: ${existingCourses.length}`);
    
    // Step 2: Create a map of official courses
    const officialCourseCodes = new Set();
    Object.values(OFFICIAL_COURSES).forEach(program => {
      Object.values(program).forEach(level => {
        Object.values(level).forEach(semester => {
          semester.forEach(code => officialCourseCodes.add(code));
        });
      });
    });
    
    console.log(`Total official course codes: ${officialCourseCodes.size}`);
    
    // Step 3: Identify courses to keep vs delete
    const coursesToKeep = [];
    const coursesToDelete = [];
    const codeGroups = {};
    
    // Group existing courses by code
    existingCourses.forEach(course => {
      const code = course.code;
      if (!codeGroups[code]) {
        codeGroups[code] = [];
      }
      codeGroups[code].push(course);
    });
    
    // Process each course code
    for (const [code, courseList] of Object.entries(codeGroups)) {
      if (officialCourseCodes.has(code)) {
        // This is an official course - keep the best instance
        if (courseList.length === 1) {
          coursesToKeep.push(courseList[0]);
        } else {
          // Multiple instances - keep the best one, delete the rest
          courseList.sort((a, b) => {
            const aHasHyphen = a.id.includes('-');
            const bHasHyphen = b.id.includes('-');
            
            if (aHasHyphen && !bHasHyphen) return -1;
            if (!aHasHyphen && bHasHyphen) return 1;
            
            return a.id.localeCompare(b.id);
          });
          
          coursesToKeep.push(courseList[0]);
          coursesToDelete.push(...courseList.slice(1));
        }
      } else {
        // This is not an official course - delete all instances
        coursesToDelete.push(...courseList);
      }
    }
    
    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  ✅ Courses to keep: ${coursesToKeep.length}`);
    console.log(`  🗑️  Courses to delete: ${coursesToDelete.length}`);
    
    // Step 4: Delete unwanted courses
    if (coursesToDelete.length > 0) {
      console.log('\n🗑️  Deleting unwanted courses...');
      let deletedCount = 0;
      
      for (const course of coursesToDelete) {
        try {
          await db.collection('academic-courses').doc(course.id).delete();
          console.log(`  Deleted: ${course.code} (${course.title})`);
          deletedCount++;
        } catch (error) {
          console.error(`  Failed to delete ${course.code}:`, error.message);
        }
      }
      
      console.log(`\n✅ Deleted ${deletedCount} unwanted courses`);
    }
    
    // Step 5: Update remaining courses with correct data
    console.log('\n🔄 Updating course data with official information...');
    let updatedCount = 0;
    
    for (const course of coursesToKeep) {
      const officialData = COURSE_DETAILS[course.code];
      if (officialData) {
        try {
          const updateData = {
            title: officialData.title,
            credits: officialData.credits,
            level: officialData.level,
            semester: officialData.semester,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          await db.collection('academic-courses').doc(course.id).update(updateData);
          console.log(`  Updated: ${course.code} - ${officialData.title}`);
          updatedCount++;
        } catch (error) {
          console.error(`  Failed to update ${course.code}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} courses with official data`);
    
    // Step 6: Create missing official courses
    console.log('\n➕ Creating missing official courses...');
    let createdCount = 0;
    
    for (const code of officialCourseCodes) {
      const existingCourse = coursesToKeep.find(c => c.code === code);
      if (!existingCourse) {
        const courseData = COURSE_DETAILS[code];
        if (courseData) {
          try {
            const newCourse = {
              code: code,
              title: courseData.title,
              credits: courseData.credits,
              level: courseData.level,
              semester: courseData.semester,
              description: courseData.title,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('academic-courses').add(newCourse);
            console.log(`  Created: ${code} - ${courseData.title}`);
            createdCount++;
          } catch (error) {
            console.error(`  Failed to create ${code}:`, error.message);
          }
        }
      }
    }
    
    console.log(`\n✅ Created ${createdCount} missing courses`);
    
    // Step 7: Update program documents with coursesPerLevel
    console.log('\n🎓 Updating program documents with coursesPerLevel...');
    
    // Get programs
    const programsSnapshot = await db.collection('academic-programs').get();
    const programs = programsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    for (const program of programs) {
      if (OFFICIAL_COURSES[program.name]) {
        try {
          const coursesPerLevel = {};
          
          Object.entries(OFFICIAL_COURSES[program.name]).forEach(([level, semesters]) => {
            coursesPerLevel[level] = {};
            Object.entries(semesters).forEach(([semester, codes]) => {
              coursesPerLevel[level][semester] = {
                'all': {
                  'Regular': codes,
                  'Weekend': codes
                }
              };
            });
          });
          
          await db.collection('academic-programs').doc(program.id).update({
            coursesPerLevel: coursesPerLevel,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`  Updated: ${program.name} with coursesPerLevel structure`);
        } catch (error) {
          console.error(`  Failed to update ${program.name}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Course cleanup and alignment completed successfully!');
    console.log(`\n📋 Final Summary:`);
    console.log(`  ✅ Kept: ${coursesToKeep.length} courses`);
    console.log(`  🗑️  Deleted: ${coursesToDelete.length} courses`);
    console.log(`  ➕ Created: ${createdCount} courses`);
    console.log(`  🎓 Updated: ${programs.filter(p => OFFICIAL_COURSES[p.name]).length} programs`);
    
    // Verify final state
    console.log('\n🔍 Verifying final state...');
    const finalSnapshot = await db.collection('academic-courses').get();
    const finalCourses = finalSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Total courses after cleanup: ${finalCourses.length}`);
    
    // Check for remaining duplicates
    const finalCodeGroups = {};
    finalCourses.forEach(course => {
      const code = course.code;
      if (!finalCodeGroups[code]) {
        finalCodeGroups[code] = [];
      }
      finalCodeGroups[code].push(course);
    });
    
    const remainingDuplicates = Object.entries(finalCodeGroups).filter(([code, courses]) => courses.length > 1);
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ No duplicates remaining!');
    } else {
      console.log(`⚠️  ${remainingDuplicates.length} course codes still have duplicates:`);
      remainingDuplicates.forEach(([code, courses]) => {
        console.log(`  ${code}: ${courses.length} instances`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.error(error.stack);
  }
}

// Ask for confirmation before running
console.log('⚠️  WARNING: This script will DELETE duplicate courses and align with official curriculum!');
console.log('Make sure you have a backup before proceeding.');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');

setTimeout(() => {
  cleanupAndAlignCourses();
}, 5000);




