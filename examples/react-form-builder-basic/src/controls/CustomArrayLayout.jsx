import {
  JsonFormsDispatch,
  withJsonFormsContext,
  withJsonFormsArrayLayoutProps,
} from '@jsonforms/react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Box, IconButton, Tooltip, Grid } from '@mui/material';
import { rankWith, composePaths, createDefaultValue } from '@jsonforms/core';

const withContextToCardRenderd = (Component) => {
  const WrappedComponent = ({ props }) => <Component {...props} />;
  WrappedComponent.displayName = `withContextToCardRenderd(${
    Component.displayName || Component.name || 'Component'
  })`;
  return WrappedComponent;
};

const withCustomProps = (Component) => {
  return withJsonFormsContext(withContextToCardRenderd(Component));
};

const CardRenderer = withCustomProps((props) => {
  const { t } = useTranslation();
  const {
    uischema,
    schema,
    path,
    renderers,
    cells,
    onRemove,
    enabled,
    boarder,
    shouldScrollTo,
    lastAddedIndexRef,
    totalItems,
    minItems,
  } = props;
  const elements = uischema.options?.['detail'];
  const isAddable = uischema?.options?.addable !== false;
  const cardRef = useRef(null);

  useEffect(() => {
    if (shouldScrollTo && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      lastAddedIndexRef.current = -1; // Reset the ref after scroll
    }
  }, [shouldScrollTo, lastAddedIndexRef]);

  return (
    <Grid
      container
      ref={cardRef}
      justify="center"
      alignItems="center"
      alignContent="center"
      sx={{
        mt: enabled ? 3 : 2,
        borderBottom: boarder ? '1px dotted #e0e0e0' : '',
      }}
    >
      <Grid item xs justify="center" alignItems="center">
        <JsonFormsDispatch
          path={path}
          cells={cells}
          schema={schema}
          enabled={enabled}
          uischema={elements}
          renderers={renderers}
        />
      </Grid>
      <Grid item xs={0.5} style={{ alignSelf: 'flex-start', ml: 10 }}>
        {enabled && isAddable && (
          <Tooltip
            title={
              totalItems <= minItems
                ? t('common.tooltip_delete_disabled_min_required')
                : t('common.tooltip_delete')
            }
          >
            <span>
              <IconButton
                aria-label={t('common.tooltip_delete')}
                onClick={onRemove}
                disabled={totalItems <= minItems}
              >
                <IconTrash />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
});

export const ArrayLayoutRenderer = (props) => {
  const { t } = useTranslation();
  const { addItem, cells, data, enabled, path, removeItems, renderers, schema, uischema } = props;

  const lastAddedIndexRef = useRef(-1);
  const minItems = schema?.minItems || 0;
  const isAddable = uischema?.options?.addable !== false;
  const autoScroll = uischema?.options?.autoScroll !== false;

  const addItemCb = useCallback(
    (p, value) => {
      if (autoScroll) {
        // Set the last added index to the current data count
        lastAddedIndexRef.current = data ? data.length : 0;
      }
      return addItem(p, value);
    },
    [addItem, data, autoScroll]
  );

  const removeItemsCb = useCallback(
    (path, toDelete) => {
      return removeItems ? removeItems(path, toDelete) : () => {};
    },
    [removeItems]
  );

  // Show at least one item if array is empty but addable
  if ((!data || data.length === 0) && isAddable && schema?.items) {
    const elements = uischema.options?.['detail'];
    return (
      <Box alignItems="center" sx={{ mt: 0, ml: 0 }}>
        {enabled && (
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <Tooltip title={'Add Item'}>
              <IconButton
                aria-label={'Add Item'}
                onClick={() => addItemCb(path, createDefaultValue(schema.items))}
              >
                <IconPlus />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <Grid
          container
          justify="center"
          alignItems="center"
          alignContent="center"
          sx={{ mt: enabled ? 3 : 2, borderBottom: '1px dotted #e0e0e0' }}
        >
          <Grid item xs justify="center" alignItems="center">
            <JsonFormsDispatch
              path={composePaths(path, '0')}
              cells={cells}
              schema={schema.items}
              enabled={false}
              uischema={elements}
              renderers={renderers}
              data={createDefaultValue(schema.items)}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const toRender = (data || []).map((_, i) => {
    const shouldScrollTo = autoScroll && i === (data?.length || 0) - 1;

    return (
      <CardRenderer
        key={i}
        index={i}
        cells={cells}
        schema={schema?.items || schema}
        enabled={enabled}
        boarder={(data?.length || 0) > 1}
        uischema={uischema}
        renderers={renderers}
        shouldScrollTo={shouldScrollTo}
        path={composePaths(path, `${i}`)}
        onRemove={removeItemsCb(path, [i])}
        lastAddedIndexRef={lastAddedIndexRef}
        totalItems={data?.length || 0}
        minItems={minItems}
      />
    );
  });
  return (
    <Box alignItems="center" sx={{ mt: 0, ml: 0 }}>
      {enabled && isAddable && schema?.items && (
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <Tooltip title={t('common.tooltip_add')}>
            <IconButton
              aria-label={t('common.tooltip_add')}
              onClick={() => addItemCb(path, createDefaultValue(schema.items))}
            >
              <IconPlus />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {toRender}
    </Box>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const customArrayLayoutTester = rankWith(10, (uischema, schema) => {
  return (
    uischema.type === 'Control' &&
    schema?.type === 'array' &&
    schema?.items?.type === 'object' &&
    uischema?.options?.detail
  );
});

const CustomArrayLayout = withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);

export default CustomArrayLayout;
