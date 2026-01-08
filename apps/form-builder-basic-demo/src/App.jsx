import FormBuilder, { configureControls } from '@dhristhi/form-builder';

import CustomInfoAlert, { customInfoAlertTester } from './controls/CustomInfoAlert';
import customSelectControl, { customSelectTester } from './controls/CustomSelectControl';
import CustomFileUploadControl, {
  customFileUploadTester,
} from './controls/CustomFileUploadControl';
import CustomTextControl, {
  customTextTester,
  customCurrencyTester,
} from './controls/CustomTextControl';
import CustomLabelControl, {
  customLabelTester,
  customImageTester,
} from './controls/CustomLabelControl';
import CustomDownloadFileControl, {
  customDownloadFileTester,
} from './controls/CustomDownloadFileControl';

import ArrayLayoutRenderer, { customArrayLayoutTester } from './controls/CustomArrayLayout';
import CustomAccordionGroupLayoutRenderer, {
  customAccordionGroupLayoutTester,
} from './controls/CustomAccordionGroupLayout';

// Internal registry of custom renderers with IDs for configuration
export const customRendererEntries = [
  { id: 'currencyText', tester: customCurrencyTester, renderer: CustomTextControl },
  { id: 'text', tester: customTextTester, renderer: CustomTextControl },
  { id: 'label', tester: customLabelTester, renderer: CustomLabelControl },
  { id: 'image', tester: customImageTester, renderer: CustomLabelControl },
  { id: 'infoAlert', tester: customInfoAlertTester, renderer: CustomInfoAlert },
  { id: 'select', tester: customSelectTester, renderer: customSelectControl },
  { id: 'downloadFile', tester: customDownloadFileTester, renderer: CustomDownloadFileControl },
  { id: 'fileUpload', tester: customFileUploadTester, renderer: CustomFileUploadControl },
  { id: 'arrayLayout', tester: customArrayLayoutTester, renderer: ArrayLayoutRenderer },
  {
    id: 'accordionGroupLayout',
    tester: customAccordionGroupLayoutTester,
    renderer: CustomAccordionGroupLayoutRenderer,
  },
];

configureControls({
  // Add custom renderers (tester + renderer components)
  add: customRendererEntries,
});

const schemas = [
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
    description: 'Professional job application with experience, skills, and document uploads',
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
    description: 'Event registration form with attendance preferences and dietary requirements',
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
          enum: ['Technical Track', 'Business Track', 'Design Track', 'All Sessions'],
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
    description: 'Customer satisfaction survey with ratings and feedback collection',
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
    description: 'E-commerce order form with product selection and shipping details',
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
      required: ['customerName', 'email', 'product', 'quantity', 'shippingAddress'],
    },
  },
  {
    id: 'all-field-types',
    name: 'All Field Types Demo',
    description: 'Demonstration form with all available field types',
    tags: ['Demo', 'All Fields', 'Reference'],
    schema: {
      type: 'object',
      properties: {
        text_field: {
          type: 'string',
          title: 'Text Field',
        },
        textarea_field: {
          type: 'string',
          title: 'Text Area Field',
          maxLength: 500,
        },
        email_field: {
          type: 'string',
          format: 'email',
          title: 'Email Field',
        },
        checkbox_field: {
          type: 'boolean',
          title: 'Checkbox Field',
        },
        radio_field: {
          type: 'string',
          title: 'Radio Button Field',
          enum: ['Option 1', 'Option 2', 'Option 3'],
        },
        number_field: {
          type: 'number',
          title: 'Number Field',
        },
        date_field: {
          type: 'string',
          format: 'date',
          title: 'Date Field',
        },
        select_single: {
          type: 'string',
          title: 'Select (Single Selection)',
          enum: ['Choice A', 'Choice B', 'Choice C', 'Choice D', 'Choice E'],
        },
        select_multiple: {
          type: 'array',
          title: 'Select (Multiple Selection)',
          items: {
            type: 'string',
            enum: ['item 1', 'item 2', 'item 3', 'item 4', 'item 5'],
          },
          uniqueItems: true,
        },
      },
      required: ['text_field', 'email_field'],
    },
  },
  {
    id: 'all-in-one-demo',
    name: 'All-in-one Demo Form',
    description: 'Comprehensive demo with string formats, arrays, enums, and file upload',
    tags: ['Demo', 'Advanced', 'Comprehensive'],
    schema: {
      type: 'object',
      properties: {
        string_basic: {
          type: 'string',
          title: 'Basic String',
          minLength: 3,
          maxLength: 100,
        },
        string_email: {
          type: 'string',
          title: 'Email',
          format: 'email',
          pattern: '^[A-Za-z0-9 _-]+$',
        },
        string_date: {
          type: 'string',
          title: 'Date',
          format: 'date',
        },
        string_url: {
          type: 'string',
          title: 'URL',
          format: 'uri',
        },
        file_upload: {
          type: 'string',
          title: 'File Upload (base64)',
          contentEncoding: 'base64',
          contentMediaType: 'application/pdf',
          pattern: '^[A-Za-z0-9+/=]+$',
        },
        number_basic: {
          type: 'number',
          title: 'Number',
          minimum: 0,
          maximum: 1000,
        },
        boolean_basic: {
          type: 'boolean',
          title: 'Boolean Flag',
        },
        array_strings: {
          type: 'array',
          title: 'Array of Strings',
          items: {
            type: 'string',
            minLength: 1,
            maxLength: 50,
          },
          minItems: 1,
          maxItems: 5,
          uniqueItems: true,
        },
        array_objects: {
          type: 'array',
          title: 'Array of Objects',
          items: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                minLength: 1,
                maxLength: 50,
              },
              value: {
                type: 'number',
                minimum: 0,
                maximum: 100,
              },
              active: {
                type: 'boolean',
              },
            },
            required: ['label', 'value'],
          },
          minItems: 1,
          maxItems: 10,
          uniqueItems: false,
        },
        select_single_enum: {
          type: 'string',
          title: 'Single Select Enum',
          enum: ['Choice A', 'Choice B', 'Choice C'],
        },
        select_multi_enum: {
          type: 'array',
          title: 'Multi Select Enum',
          items: {
            type: 'string',
            enum: [
              'item 1',
              'item 2',
              'item 3',
              'item 4',
              'item 5',
              'item 6',
              'item 7',
              'item 8',
              'item 9',
              'item 0',
            ],
          },
          minItems: 1,
          maxItems: 3,
          uniqueItems: true,
        },
      },
      required: [
        'string_basic',
        'string_email',
        'number_basic',
        'boolean_basic',
        'array_strings',
        'array_objects',
      ],
      additionalProperties: false,
    },
  },
  {
    id: 'computed-plan',
    name: 'Computed Plan Form',
    description: 'Plan selection with computed readonly field',
    tags: ['Demo', 'Computed', 'ReadOnly'],
    schema: {
      type: 'object',
      properties: {
        plan: {
          type: 'string',
          title: 'Plan',
          enum: ['basic', 'pro', 'enterprise'],
        },
        tier: {
          type: 'string',
          title: 'Tier',
          enum: ['monthly', 'yearly'],
        },
        computed_plan_label: {
          type: 'string',
          title: 'Computed Plan Label',
          enum: [
            'Basic – Monthly',
            'Basic – Yearly',
            'Pro – Monthly',
            'Pro – Yearly',
            'Enterprise – Monthly',
            'Enterprise – Yearly',
          ],
          readOnly: true,
        },
      },
      required: ['plan', 'tier'],
      additionalProperties: false,
    },
  },
  {
    id: 'company-profile',
    name: 'Company Profile Form',
    description:
      'Company profile with grouped sections for basic info, contact details, and business information',
    tags: ['Company', 'Profile', 'Business'],
    schema: {
      type: 'object',
      properties: {
        company_details: {
          type: 'object',
          title: 'Company Details',
          properties: {
            company_name: {
              type: 'string',
              title: 'Company Name',
            },
            registration_number: {
              type: 'string',
              title: 'Registration Number',
            },
            industry: {
              type: 'string',
              title: 'Industry',
              enum: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Other'],
            },
            founded_year: {
              type: 'number',
              title: 'Founded Year',
              minimum: 1800,
              maximum: 2024,
            },
          },
          required: ['company_name', 'registration_number', 'industry'],
        },
        contact_information: {
          type: 'object',
          title: 'Contact Information',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              title: 'Business Email',
            },
            phone: {
              type: 'string',
              title: 'Phone Number',
            },
            website: {
              type: 'string',
              title: 'Website URL',
            },
            address: {
              type: 'object',
              title: 'Business Address',
              properties: {
                street: {
                  type: 'string',
                  title: 'Street Address',
                },
                city: {
                  type: 'string',
                  title: 'City',
                },
                state: {
                  type: 'string',
                  title: 'State/Province',
                },
                postal_code: {
                  type: 'string',
                  title: 'Postal Code',
                },
                country: {
                  type: 'string',
                  title: 'Country',
                },
              },
              required: ['street', 'city', 'country'],
            },
          },
          required: ['email', 'phone'],
        },
        business_info: {
          type: 'object',
          title: 'Business Information',
          properties: {
            employee_count: {
              type: 'string',
              title: 'Number of Employees',
              enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
            },
            annual_revenue: {
              type: 'string',
              title: 'Annual Revenue Range',
              enum: ['< $1M', '$1M - $10M', '$10M - $50M', '$50M - $100M', '> $100M'],
            },
            description: {
              type: 'string',
              title: 'Company Description',
              maxLength: 1000,
            },
            public_company: {
              type: 'boolean',
              title: 'Publicly Traded Company',
            },
          },
          required: ['employee_count'],
        },
      },
      required: ['company_details', 'contact_information', 'business_info'],
    },
  },
  {
    id: 'organization-onboarding',
    name: 'Organization Onboarding Form',
    description:
      'Comprehensive onboarding form for new organizations with multiple departments and contacts',
    tags: ['Onboarding', 'Organization', 'Multi-department'],
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
              enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Prefer not to say'],
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
              enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say'],
            },
            nationality: {
              type: 'string',
            },
            profile_picture: {
              type: 'string',
            },
          },
          required: ['first_name', 'last_name', 'date_of_birth', 'gender', 'nationality'],
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
              required: ['address_line_1', 'address_line_2', 'city', 'state', 'country', 'zipcode'],
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
              required: ['address_line_1', 'address_line_2', 'city', 'state', 'country', 'zipcode'],
            },
          },
          required: ['contact_number', 'email'],
        },
        education: {
          type: 'array',
          title: 'Education',
          items: {
            type: 'object',
            properties: {
              degree: {
                type: 'string',
                enum: ['High School', 'Associate', 'Bachelor', 'Master', 'Doctorate'],
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
            },
            required: ['degree', 'field_of_study', 'institution_name', 'start_year'],
          },
          minItems: 1,
          uniqueItems: true,
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
            required: ['issuer', 'number', 'level', 'name', 'issue_date', 'expiry_date'],
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
                enum: ['UPLOAD-PENDING', 'REVIEW-PENDING', 'ACCEPTED', 'REJECTED'],
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
              enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level'],
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

export default function DemoApp() {
  const handleSchemaSave = (schema, uischema) => {
    console.log('Schema changed:', { schema, uischema });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FormBuilder schemas={schemas} onSave={handleSchemaSave} />
    </div>
  );
}
