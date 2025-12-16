import React from "react";
import * as TablerIcons from "@tabler/icons-react";
import { JsonFormsDispatch } from "@jsonforms/react";
import { withJsonFormsLayoutProps } from "@jsonforms/react";
import { Typography, Card, CardContent, Hidden } from "@mui/material";

const CustomGroupRenderer = (props) => {
  const { uischema, schema, path, enabled, renderers, cells, visible } = props;
  const icon = uischema?.icon; // Icon at root level, not in options
  const elements = uischema.elements || [];
  const label = typeof uischema.label === "string" ? uischema.label : "";

  if (!visible) {
    return null;
  }

  return (
    <Hidden xsUp={!visible}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          {label && (
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              {icon &&
                TablerIcons[icon] &&
                React.createElement(TablerIcons[icon], { size: 20 })}
              {label}
            </Typography>
          )}
          {elements.map((element, index) => (
            <JsonFormsDispatch
              key={`${path}-${index}`}
              uischema={element}
              schema={schema}
              path={path}
              enabled={enabled}
              renderers={renderers}
              cells={cells}
            />
          ))}
        </CardContent>
      </Card>
    </Hidden>
  );
};

export default withJsonFormsLayoutProps(CustomGroupRenderer);
