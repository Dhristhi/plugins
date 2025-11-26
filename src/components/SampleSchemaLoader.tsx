import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { FormField, FieldType, defaultFieldTypes } from '../types';

interface SchemaImporterProps {
  open: boolean;
  onClose: () => void;
  onImportSchema: (fields: FormField[]) => void;
}

interface SampleSchema {
  id: string;
  name: string;
  description: string;
  tags: string[];
  schema: any;
  uiSchema?: any;
}

const sampleSchemas: SampleSchema[] = [
  {
    id: 'user-registration',
    name: 'User Registration Form',
    description:
      'Complete user registration with personal details, contact information, and preferences',
    tags: ['Registration', 'User', 'Contact'],
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 2,
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 2,
        },
        email: {
          type: 'string',
          format: 'email',
          title: 'Email Address',
        },
        phone: {
          type: 'string',
          title: 'Phone Number',
          pattern: '^[+]?[0-9\\s\\-\\(\\)]{10,}$',
        },
        age: {
          type: 'number',
          title: 'Age',
          minimum: 13,
          maximum: 120,
        },
        country: {
          type: 'string',
          title: 'Country',
          enum: ['USA', 'Canada', 'UK', 'Germany', 'France', 'Other'],
        },
        newsletter: {
          type: 'boolean',
          title: 'Subscribe to Newsletter',
        },
        bio: {
          type: 'string',
          title: 'Bio',
          maxLength: 500,
        },
      },
      required: ['firstName', 'lastName', 'email'],
    },
  },
  {
    id: 'job-application',
    name: 'Job Application Form',
    description:
      'Professional job application with experience, skills, and document uploads',
    tags: ['Job', 'Application', 'Professional'],
    schema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          title: 'Full Name',
        },
        email: {
          type: 'string',
          format: 'email',
          title: 'Email',
        },
        position: {
          type: 'string',
          title: 'Position Applied For',
          enum: [
            'Software Engineer',
            'Product Manager',
            'Designer',
            'Data Scientist',
            'DevOps Engineer',
          ],
        },
        experience: {
          type: 'string',
          title: 'Years of Experience',
          enum: ['0-1', '2-3', '4-6', '7-10', '10+'],
        },
        skills: {
          type: 'string',
          title: 'Technical Skills',
          maxLength: 1000,
        },
        coverLetter: {
          type: 'string',
          title: 'Cover Letter',
          maxLength: 2000,
        },
        relocate: {
          type: 'boolean',
          title: 'Willing to Relocate',
        },
        salary: {
          type: 'number',
          title: 'Expected Salary (USD)',
          minimum: 30000,
        },
      },
      required: ['fullName', 'email', 'position', 'experience'],
    },
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description:
      'Event registration form with attendance preferences and dietary requirements',
    tags: ['Event', 'Registration', 'Conference'],
    schema: {
      type: 'object',
      properties: {
        attendeeName: {
          type: 'string',
          title: 'Attendee Name',
        },
        company: {
          type: 'string',
          title: 'Company/Organization',
        },
        email: {
          type: 'string',
          format: 'email',
          title: 'Email',
        },
        ticketType: {
          type: 'string',
          title: 'Ticket Type',
          enum: ['Standard', 'VIP', 'Student', 'Speaker'],
        },
        sessions: {
          type: 'string',
          title: 'Interested Sessions',
          enum: [
            'Technical Track',
            'Business Track',
            'Design Track',
            'All Sessions',
          ],
        },
        dietaryRequirements: {
          type: 'string',
          title: 'Dietary Requirements',
          enum: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Other'],
        },
        networking: {
          type: 'boolean',
          title: 'Join Networking Event',
        },
        accommodation: {
          type: 'boolean',
          title: 'Need Accommodation Assistance',
        },
      },
      required: ['attendeeName', 'email', 'ticketType'],
    },
  },
  {
    id: 'survey-feedback',
    name: 'Customer Feedback Survey',
    description:
      'Customer satisfaction survey with ratings and feedback collection',
    tags: ['Survey', 'Feedback', 'Rating'],
    schema: {
      type: 'object',
      properties: {
        customerName: {
          type: 'string',
          title: 'Customer Name (Optional)',
        },
        email: {
          type: 'string',
          format: 'email',
          title: 'Email (Optional)',
        },
        overallRating: {
          type: 'number',
          title: 'Overall Satisfaction',
          minimum: 1,
          maximum: 5,
          enum: [1, 2, 3, 4, 5],
          enumNames: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
        },
        productQuality: {
          type: 'number',
          title: 'Product Quality Rating',
          minimum: 1,
          maximum: 5,
        },
        customerService: {
          type: 'number',
          title: 'Customer Service Rating',
          minimum: 1,
          maximum: 5,
        },
        recommend: {
          type: 'boolean',
          title: 'Would you recommend us to others?',
        },
        improvements: {
          type: 'string',
          title: 'Suggestions for Improvement',
          maxLength: 1000,
        },
        futureContact: {
          type: 'boolean',
          title: 'May we contact you for follow-up?',
        },
      },
      required: ['overallRating'],
    },
  },
  {
    id: 'product-order',
    name: 'Product Order Form',
    description:
      'E-commerce order form with product selection and shipping details',
    tags: ['E-commerce', 'Order', 'Shopping'],
    schema: {
      type: 'object',
      properties: {
        customerName: {
          type: 'string',
          title: 'Full Name',
        },
        email: {
          type: 'string',
          format: 'email',
          title: 'Email',
        },
        phone: {
          type: 'string',
          title: 'Phone Number',
        },
        product: {
          type: 'string',
          title: 'Product',
          enum: ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Smart Watch'],
        },
        quantity: {
          type: 'number',
          title: 'Quantity',
          minimum: 1,
          maximum: 10,
        },
        shippingAddress: {
          type: 'string',
          title: 'Shipping Address',
          maxLength: 500,
        },
        shippingMethod: {
          type: 'string',
          title: 'Shipping Method',
          enum: ['Standard (5-7 days)', 'Express (2-3 days)', 'Overnight'],
        },
        giftWrap: {
          type: 'boolean',
          title: 'Gift Wrap ($5 extra)',
        },
        specialInstructions: {
          type: 'string',
          title: 'Special Instructions',
          maxLength: 200,
        },
      },
      required: [
        'customerName',
        'email',
        'product',
        'quantity',
        'shippingAddress',
      ],
    },
  },
  {
    id: 'org-chart',
    name: 'Organization Chart Form',
    description:
      'Form to capture organizational hierarchy and employee details',
    tags: ['Organization', 'Hierarchy', 'Employee'],
    schema: {
      type: 'object',
      properties: {
        personal_info: {
          type: 'object',
          properties: {
            first_name: {
              type: 'string',
              isTitle: true,
              tableView: true,
              showAvatar: true,
              picturePath: 'personal_info.profile_picture',
              title: 'First Name',
            },
            middle_name: {
              type: 'string',
              title: 'Middle Name',
            },
            last_name: {
              type: 'string',
              isTitle: true,
              tableView: true,
              title: 'Last Name',
            },
            blood_group: {
              type: 'string',
              title: 'Blood Group',
              enum: [
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-',
                'Prefer not to say',
              ],
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              title: 'Date of Birth',
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
            },
            marital_status: {
              type: 'string',
              enum: [
                'Single',
                'Married',
                'Divorced',
                'Widowed',
                'Prefer not to say',
              ],
            },
            nationality: {
              type: 'string',
            },
            profile_picture: {
              type: 'string',
            },
          },
          required: [
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'nationality',
          ],
        },
        contact_info: {
          type: 'object',
          properties: {
            contact_number: {
              type: 'string',
              title: 'Contact Number',
            },
            email: {
              type: 'string',
              title: 'Email',
            },
            current_address: {
              type: 'object',
              properties: {
                address_line_1: {
                  type: 'string',
                },
                address_line_2: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                country: {
                  type: 'string',
                },
                zipcode: {
                  type: 'string',
                },
              },
              required: [
                'address_line_1',
                'address_line_2',
                'city',
                'state',
                'country',
                'zipcode',
              ],
            },
            permanent_address: {
              type: 'object',
              properties: {
                address_line_1: {
                  type: 'string',
                },
                address_line_2: {
                  type: 'string',
                },
                city: {
                  type: 'string',
                },
                state: {
                  type: 'string',
                },
                country: {
                  type: 'string',
                },
                zipcode: {
                  type: 'string',
                },
              },
              required: [
                'address_line_1',
                'address_line_2',
                'city',
                'state',
                'country',
                'zipcode',
              ],
            },
          },
          required: ['contact_number', 'email'],
        },
        education: {
          degree: {
            type: 'string',
            enum: [
              'High School',
              'Associate',
              'Bachelor',
              'Master',
              'Doctorate',
            ],
          },
          field_of_study: {
            type: 'string',
          },
          institution_name: {
            type: 'string',
          },
          start_year: {
            type: 'number',
          },
          end_year: {
            type: 'number',
          },
          required: [
            'degree',
            'field_of_study',
            'institution_name',
            'start_year',
          ],
        },
        emergency_contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              first_name: {
                type: 'string',
              },
              middle_name: {
                type: 'string',
              },
              last_name: {
                type: 'string',
              },
              contact_number: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              relation: {
                type: 'string',
              },
            },
            required: ['first_name', 'last_name', 'contact_number', 'relation'],
          },
          minItems: 1,
          uniqueItems: true,
        },
        experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              organisation: {
                type: 'string',
              },
              experience_years: {
                type: 'number',
              },
              startDate: {
                type: 'string',
                format: 'date',
                title: 'Start Date',
              },
              endDate: {
                type: 'string',
                format: 'date',
                title: 'End Date',
              },
              address: {
                type: 'string',
              },
              contact: {
                type: 'string',
              },
            },
            required: [
              'organisation',
              'experience_years',
              'startDate',
              'endDate',
              'address',
              'contact',
            ],
          },
        },
        certifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              issuer: {
                type: 'string',
              },
              number: {
                type: 'string',
              },
              level: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              issue_date: {
                type: 'string',
                format: 'date',
              },
              expiry_date: {
                type: 'string',
                format: 'date',
              },
            },
            required: [
              'issuer',
              'number',
              'level',
              'name',
              'issue_date',
              'expiry_date',
            ],
          },
        },
        passport: {
          type: 'object',
          properties: {
            number: {
              type: 'string',
            },
            nationality: {
              type: 'string',
            },
            expiry_date: {
              type: 'string',
              format: 'date',
            },
            full_name: {
              type: 'string',
            },
          },
          required: ['number', 'nationality', 'expiry_date', 'full_name'],
        },
        visa: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              visa_number: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              nationality: {
                type: 'string',
              },
              date_of_birth: {
                type: 'string',
                format: 'date',
              },
              issue_date: {
                type: 'string',
                format: 'date',
              },
              expiry_date: {
                type: 'string',
                format: 'date',
              },
              visa_type: {
                type: 'string',
                enum: ['Tourist', 'Business', 'Work', 'Student', 'Transit'],
              },
            },
            required: [
              'visa_number',
              'name',
              'nationality',
              'date_of_birth',
              'issue_date',
              'expiry_date',
              'visa_type',
            ],
          },
          uniqueItems: true,
        },
        documents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: [
                  'UPLOAD-PENDING',
                  'REVIEW-PENDING',
                  'ACCEPTED',
                  'REJECTED',
                ],
              },
              comments: {
                type: 'string',
              },
            },
            required: ['id', 'type', 'description', 'status'],
          },
        },
        documents_issued: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              type: {
                type: 'string',
              },
              description: {
                type: 'string',
              },
            },
            required: ['id', 'type', 'description'],
          },
        },
        employment_info: {
          type: 'object',
          properties: {
            employeeid: {
              type: 'string',
              title: 'Employee Id',
              tableView: true,
              isSubTitle: true,
            },
            joining_date: {
              type: 'string',
              format: 'date',
            },
            email: {
              type: 'string',
              title: 'Email',
            },
            employee_level: {
              type: 'string',
              enum: [
                'Junior',
                'Mid',
                'Senior',
                'Lead',
                'Manager',
                'Director',
                'VP',
                'C-Level',
              ],
            },
            job_role: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                },
                title: {
                  type: 'string',
                  tableView: true,
                  title: 'Job Role',
                },
              },
              required: ['code', 'title'],
            },
            designation: {
              type: 'string',
              title: 'Designation',
              tableView: true,
            },
            office_location: {
              type: 'string',
              title: 'Office Location',
              tableView: true,
              isSubTitle: true,
            },
            salary: {
              type: 'object',
              tableView: true,
              title: 'Salary Details',
              properties: {
                currency: {
                  type: 'string',
                  title: 'Currency',
                },
                currency_icon: {
                  type: 'string',
                  title: 'Currency Icon',
                },
                basic_salary: {
                  type: 'number',
                  title: 'Basic Salary',
                },
                allowances: {
                  type: 'number',
                  title: 'Allowances',
                },
                deductions: {
                  type: 'number',
                  title: 'Deductions',
                },
                net_salary: {
                  type: 'number',
                  title: 'Net Salary',
                },
              },
              required: [
                'currency',
                'currency_icon',
                'basic_salary',
                'allowances',
                'deductions',
                'net_salary',
              ],
            },
            hr_partner: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  title: 'HR Partner',
                },
                employeeid: {
                  type: 'string',
                },
              },
              required: ['name', 'employeeid'],
            },
            reporting_manager: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                employeeid: {
                  type: 'string',
                },
              },
              required: ['name', 'employeeid'],
            },

            accounts: {
              type: 'array',
              title: 'Accounts',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    title: 'Account ID',
                  },
                  name: {
                    type: 'string',
                    title: 'Account Name',
                    tableView: true,
                    isSubTitle: true,
                  },
                  start_date: {
                    type: 'string',
                    format: 'date',
                    title: 'Start Date',
                  },
                  end_date: {
                    type: 'string',
                    format: 'date',
                    title: 'End Date',
                  },
                  projects: {
                    type: 'array',
                    title: 'Projects',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          title: 'Project ID',
                        },
                        name: {
                          type: 'string',
                          title: 'Project Name',
                          tableView: true,
                        },
                        start_date: {
                          type: 'string',
                          format: 'date',
                          title: 'Start Date',
                        },
                        end_date: {
                          type: 'string',
                          format: 'date',
                          title: 'End Date',
                        },
                      },
                      required: ['id', 'name', 'start_date', 'end_date'],
                    },
                  },
                },
                required: ['id', 'name', 'start_date', 'end_date'],
              },
            },
          },
          required: [
            'salary',
            'job_role',
            'employeeid',
            'designation',
            'joining_date',
            'hr_partner',
            'employee_level',
            'office_location',
            'reporting_manager',
          ],
        },
        skills: {
          type: 'array',
          title: 'Skills',
          tableView: true,
          items: {
            type: 'object',
            properties: {
              skill: {
                type: 'string',
                title: 'Skills',
                tableView: true,
              },
              self: {
                type: 'number',
                title: 'Self Rating',
              },
              system: {
                type: 'number',
                title: 'System Rating',
              },
            },
            required: ['skill'],
          },
        },
      },
      required: [
        'personal_info',
        'contact_info',
        'education',
        'emergency_contacts',
        'skills',
        'documents',
        'documents_issued',
        'employment_info',
      ],
    },
  },
];

const SchemaImporter: React.FC<SchemaImporterProps> = ({
  open,
  onClose,
  onImportSchema,
}) => {
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Use a counter to generate truly unique IDs that are StrictMode safe
  const fieldCounter = React.useRef(0);

  const generateFieldKey = (
    fieldType: string,
    existingKeys: string[] = []
  ): string => {
    let baseKey = fieldType.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    let key = baseKey;
    let counter = 1;

    while (existingKeys.includes(key)) {
      key = `${baseKey}_${counter}`;
      counter++;
    }

    return key;
  };

  const mapSchemaPropertyToFieldType = (property: any): FieldType => {
    const { type, enum: enumValues, format } = property;

    if (enumValues && enumValues.length > 0) {
      if (enumValues.length <= 3) {
        return (
          defaultFieldTypes.find((ft) => ft.id === 'radio') ||
          defaultFieldTypes[0]
        );
      } else {
        return (
          defaultFieldTypes.find((ft) => ft.id === 'select') ||
          defaultFieldTypes[0]
        );
      }
    }

    switch (type) {
      case 'string':
        if (format === 'email') {
          return (
            defaultFieldTypes.find((ft) => ft.id === 'email') ||
            defaultFieldTypes[0]
          );
        }
        if (property.maxLength && property.maxLength > 100) {
          return (
            defaultFieldTypes.find((ft) => ft.id === 'textarea') ||
            defaultFieldTypes[0]
          );
        }
        return (
          defaultFieldTypes.find((ft) => ft.id === 'text') ||
          defaultFieldTypes[0]
        );
      case 'number':
      case 'integer':
        return (
          defaultFieldTypes.find((ft) => ft.id === 'number') ||
          defaultFieldTypes[0]
        );
      case 'boolean':
        return (
          defaultFieldTypes.find((ft) => ft.id === 'checkbox') ||
          defaultFieldTypes[0]
        );
      default:
        return (
          defaultFieldTypes.find((ft) => ft.id === 'text') ||
          defaultFieldTypes[0]
        );
    }
  };

  const isComplexSchema = (schema: any): boolean => {
    if (!schema || !schema.properties) return false;
    const propertyCount = Object.keys(schema.properties).length;
    return propertyCount >= 5; // Consider 5+ fields as complex
  };

  // Semantic analysis helper functions
  const analyzeFieldSemantic = (
    fieldName: string,
    fieldSchema: any
  ): string[] => {
    const semantics: string[] = [];
    const name = fieldName.toLowerCase();
    const { type, format, enum: enumValues, title, maxLength } = fieldSchema;

    // Identity and personal semantics
    if (
      /^(first|last|full|middle).*name|^name$|^(user|person|customer|attendee).*name/i.test(
        name
      ) ||
      (title && /name/i.test(title))
    ) {
      semantics.push('identity');
    }
    if (/age|birth|gender|marital|nationality|blood/i.test(name)) {
      semantics.push('personal');
    }

    // Contact semantics
    if (format === 'email' || /email/i.test(name)) {
      semantics.push('contact');
    }
    if (/phone|mobile|contact.*number|tel/i.test(name)) {
      semantics.push('contact');
    }
    if (/address|city|state|country|zip|postal/i.test(name)) {
      semantics.push('location');
    }

    // Professional semantics
    if (
      /position|job|role|title|company|organization|department|salary|experience|skill/i.test(
        name
      )
    ) {
      semantics.push('professional');
    }

    // Event/booking semantics
    if (
      /ticket|session|event|conference|workshop|accommodation|dietary/i.test(
        name
      )
    ) {
      semantics.push('event');
    }

    // Commerce semantics
    if (/product|quantity|shipping|order|item|price|payment|gift/i.test(name)) {
      semantics.push('commerce');
    }

    // Feedback semantics
    if (
      /rating|feedback|review|satisfaction|comment|improvement|recommend/i.test(
        name
      ) ||
      (type === 'number' && enumValues && enumValues.length <= 10)
    ) {
      semantics.push('feedback');
    }

    // Preference semantics
    if (
      type === 'boolean' &&
      /newsletter|notify|prefer|subscribe|agree|accept/i.test(name)
    ) {
      semantics.push('preference');
    }

    // Documents and certification
    if (/document|certificate|visa|passport|education|degree/i.test(name)) {
      semantics.push('documentation');
    }

    // Emergency and safety
    if (/emergency|contact.*person|next.*of.*kin/i.test(name)) {
      semantics.push('emergency');
    }

    // If no specific semantic found, analyze by type and context
    if (semantics.length === 0) {
      if (type === 'string' && maxLength && maxLength > 100) {
        semantics.push('description');
      } else if (type === 'boolean') {
        semantics.push('option');
      } else if (format === 'date') {
        semantics.push('temporal');
      } else {
        semantics.push('general');
      }
    }

    return semantics;
  };

  const generateGroupName = (semantic: string, fields: string[]): string => {
    const groupMappings: { [key: string]: string } = {
      identity: 'Personal Information',
      personal: 'Personal Details',
      contact: 'Contact Information',
      location: 'Address & Location',
      professional: 'Professional Details',
      event: 'Event Information',
      commerce: 'Order & Shipping',
      feedback: 'Feedback & Ratings',
      preference: 'Preferences & Settings',
      documentation: 'Documents & Certificates',
      emergency: 'Emergency Contacts',
      temporal: 'Dates & Timeline',
      description: 'Additional Information',
      option: 'Options & Choices',
      general: 'General Information',
    };

    // Try to make the name more specific based on field analysis
    if (semantic === 'general' && fields.length > 0) {
      const sampleField = fields[0].toLowerCase();
      if (/customer|client/i.test(sampleField)) return 'Customer Information';
      if (/employee|staff|worker/i.test(sampleField)) return 'Employee Details';
      if (/user|account/i.test(sampleField)) return 'User Information';
      if (/product|item/i.test(sampleField)) return 'Product Details';
    }

    return groupMappings[semantic] || 'Form Fields';
  };

  const groupRelatedFields = (
    properties: any
  ): { [groupName: string]: string[] } => {
    const fieldSemantics: { [field: string]: string[] } = {};
    const semanticGroups: { [semantic: string]: string[] } = {};

    // Analyze each field's semantics
    Object.entries(properties).forEach(
      ([fieldName, fieldSchema]: [string, any]) => {
        const semantics = analyzeFieldSemantic(fieldName, fieldSchema);
        fieldSemantics[fieldName] = semantics;

        // Group by primary semantic (first one is usually most relevant)
        const primarySemantic = semantics[0] || 'general';
        if (!semanticGroups[primarySemantic]) {
          semanticGroups[primarySemantic] = [];
        }
        semanticGroups[primarySemantic].push(fieldName);
      }
    );

    // Convert semantic groups to named groups
    const groups: { [groupName: string]: string[] } = {};
    const ungrouped: string[] = [];

    Object.entries(semanticGroups).forEach(([semantic, fields]) => {
      if (fields.length >= 2) {
        // Only create groups with 2+ fields
        const groupName = generateGroupName(semantic, fields);
        groups[groupName] = fields;
      } else {
        // Single fields go to ungrouped for reassignment
        ungrouped.push(...fields);
      }
    });

    // Handle ungrouped fields - try to merge with existing groups or create a general group
    if (ungrouped.length > 0) {
      if (ungrouped.length >= 3 || Object.keys(groups).length === 0) {
        // Create a general group if we have many ungrouped fields or no other groups
        groups['Additional Fields'] = ungrouped;
      } else {
        // Distribute ungrouped fields to existing groups based on secondary semantics
        ungrouped.forEach((field) => {
          const semantics = fieldSemantics[field];
          let assigned = false;

          // Try to find a group that matches any of this field's semantics
          for (const [groupName, groupFields] of Object.entries(groups)) {
            for (const semantic of semantics) {
              const groupSemantic = generateGroupName(semantic, []);
              if (
                groupName === groupSemantic ||
                groupName.includes(semantic) ||
                groupFields.some((gf) => fieldSemantics[gf]?.includes(semantic))
              ) {
                groups[groupName].push(field);
                assigned = true;
                break;
              }
            }
            if (assigned) break;
          }

          // If still not assigned, add to the largest group
          if (!assigned && Object.keys(groups).length > 0) {
            const largestGroup = Object.keys(groups).reduce((a, b) =>
              groups[a].length > groups[b].length ? a : b
            );
            groups[largestGroup].push(field);
          }
        });
      }
    }

    return groups;
  };

  const createGroupField = (groupName: string): FormField => {
    fieldCounter.current += 1;
    const uniqueId = fieldCounter.current;

    return {
      id: `field_${uniqueId}`,
      type: 'group',
      label: groupName,
      key: `group_${uniqueId}`,
      required: false,
      schema: {},
      uischema: {
        type: 'Group',
        label: groupName,
        elements: [],
      },
      isLayout: true,
      children: [],
      parentId: undefined,
    };
  };

  const convertSchemaToFields = (schema: any, uiSchema?: any): FormField[] => {
    if (!schema || !schema.properties) {
      throw new Error('Invalid schema: missing properties object');
    }

    const fields: FormField[] = [];
    const existingKeys: string[] = [];
    const requiredFields = schema.required || [];

    // Check if this is a complex schema that should be grouped
    const shouldGroup = isComplexSchema(schema);

    if (shouldGroup) {
      // Group related fields
      const fieldGroups = groupRelatedFields(schema.properties);

      // Create groups and add fields to them
      Object.entries(fieldGroups).forEach(([groupName, propertyKeys]) => {
        const groupField = createGroupField(groupName);

        // Create child fields for this group
        propertyKeys.forEach((propertyKey) => {
          const propertyValue = schema.properties[propertyKey];
          const fieldType = mapSchemaPropertyToFieldType(propertyValue);
          const fieldKey = generateFieldKey(propertyKey, existingKeys);
          existingKeys.push(fieldKey);

          fieldCounter.current += 1;
          const uniqueId = fieldCounter.current;

          const childField: FormField = {
            id: `field_${uniqueId}`,
            type: fieldType.id,
            label:
              propertyValue.title ||
              propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1),
            key: fieldKey,
            required: requiredFields.includes(propertyKey),
            schema: {
              ...fieldType.schema,
              ...propertyValue,
            },
            uischema: {
              ...fieldType.uischema,
              scope: `#/properties/${fieldKey}`,
            },
            parentId: groupField.id,
          };

          // Handle enum values for select/radio fields
          if (propertyValue.enum) {
            childField.schema.enum = propertyValue.enum;
            if (propertyValue.enumNames) {
              childField.schema.enumNames = propertyValue.enumNames;
            }
          }

          groupField.children!.push(childField);
        });

        fields.push(groupField);
      });
    } else {
      // Handle simple schemas without grouping (existing logic)

      Object.entries(schema.properties).forEach(
        ([propertyKey, propertyValue]: [string, any]) => {
          const fieldType = mapSchemaPropertyToFieldType(propertyValue);
          const fieldKey = generateFieldKey(propertyKey, existingKeys);
          existingKeys.push(fieldKey);

          // Extract UI schema information if available
          let uiSchemaElement = null;
          if (uiSchema && uiSchema.elements) {
            uiSchemaElement = uiSchema.elements.find(
              (element: any) => element.scope === `#/properties/${propertyKey}`
            );
          }

          // Use a unique counter to prevent StrictMode duplications
          fieldCounter.current += 1;
          const uniqueId = fieldCounter.current;

          const newField: FormField = {
            id: `field_${uniqueId}`,
            type: fieldType.id,
            label:
              propertyValue.title ||
              propertyKey.charAt(0).toUpperCase() + propertyKey.slice(1),
            key: fieldKey,
            required: requiredFields.includes(propertyKey),
            schema: {
              ...fieldType.schema,
              ...propertyValue,
            },
            uischema: {
              ...fieldType.uischema,
              ...(uiSchemaElement || {}),
              scope: `#/properties/${fieldKey}`,
            },
          };

          // Handle enum values for select/radio fields
          if (propertyValue.enum) {
            newField.schema.enum = propertyValue.enum;
            if (propertyValue.enumNames) {
              newField.schema.enumNames = propertyValue.enumNames;
            }
          }

          fields.push(newField);
        }
      );
    }

    return fields;
  };

  const handleLoadSchema = () => {
    try {
      setError('');

      if (!selectedSchema) {
        throw new Error('Please select a sample schema');
      }

      const sampleSchema = sampleSchemas.find((s) => s.id === selectedSchema);
      if (!sampleSchema) {
        throw new Error('Sample schema not found');
      }

      const fields = convertSchemaToFields(
        sampleSchema.schema,
        sampleSchema.uiSchema
      );
      onImportSchema(fields);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error loading sample schema');
    }
  };

  const handleClose = () => {
    setSelectedSchema('');
    setError('');
    onClose();
  };

  const selectedSchemaData = sampleSchemas.find((s) => s.id === selectedSchema);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Load Sample Schema</DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Select from predefined sample schemas to quickly get started with
          common form types.
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Choose Sample Schema</InputLabel>
          <Select
            value={selectedSchema}
            label="Choose Sample Schema"
            onChange={(e) => setSelectedSchema(e.target.value)}
          >
            {sampleSchemas.map((schema) => (
              <MenuItem key={schema.id} value={schema.id}>
                {schema.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSchemaData && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedSchemaData.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedSchemaData.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedSchemaData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Fields to be created:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {Object.keys(selectedSchemaData.schema.properties).length}{' '}
                  fields:{' '}
                  {Object.keys(selectedSchemaData.schema.properties)
                    .slice(0, 3)
                    .join(', ')}
                  {Object.keys(selectedSchemaData.schema.properties).length >
                    3 && '...'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleLoadSchema}
          variant="contained"
          color="primary"
          disabled={!selectedSchema}
        >
          Load Schema
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SchemaImporter;
