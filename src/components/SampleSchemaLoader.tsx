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
];

const SchemaImporter: React.FC<SchemaImporterProps> = ({
  open,
  onClose,
  onImportSchema,
}) => {
  const [selectedSchema, setSelectedSchema] = useState<string>('');
  const [error, setError] = useState<string>('');

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

  const convertSchemaToFields = (schema: any, uiSchema?: any): FormField[] => {
    if (!schema || !schema.properties) {
      throw new Error('Invalid schema: missing properties object');
    }

    const fields: FormField[] = [];
    const existingKeys: string[] = [];
    const requiredFields = schema.required || [];

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

        const newField: FormField = {
          id: `field_${Date.now()}_${Math.random()}`,
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
