import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Box, IconButton, Tooltip, Grid } from '@mui/material';
import {
  composePaths,
  createDefaultValue,
  isObjectArrayWithNesting,
  rankWith,
} from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsContext,
  withJsonFormsArrayLayoutProps,
} from '@jsonforms/react';

const withContextToCardRenderd = (Component) => {
  const WrappedComponent = ({ props }) => <Component {...props} />;
  WrappedComponent.displayName = `withContextToCardRenderd(${Component.displayName || Component.name || 'Component'})`;
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
      justify='center'
      alignItems='center'
      alignContent='center'
      sx={{ mt: enabled ? 3 : 2, borderBottom: boarder ? '1px dotted #e0e0e0' : '' }}
    >
      <Grid item xs justify='center' alignItems='center'>
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
  const isAddable = uischema?.options?.addable !== false;
  const autoScroll = uischema?.options?.autoScroll !== false;
  const lastAddedIndexRef = useRef(-1);
  const minItems = schema?.minItems || 0;
  const emptyValue = uischema?.options?.emptyValue;

  const addItemCb = useCallback(
    (p, value) => {
      if (autoScroll) {
        // Set the last added index to the current data count
        lastAddedIndexRef.current = data;
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

  // Show default value if default value is specified and array is empty
  if ((!data || data.length === 0) && schema?.default) {
    const elements = uischema.options?.['detail'];
    const defaultItem = createDefaultValue(schema.default);
    return (
      <Box alignItems='center' sx={{ mt: 0, ml: 0 }}>
        <Grid
          container
          justify='center'
          alignItems='center'
          alignContent='center'
          sx={{ mt: enabled ? 3 : 2, borderBottom: '1px dotted #e0e0e0' }}
        >
          <Grid item xs justify='center' alignItems='center'>
            <JsonFormsDispatch
              path={composePaths(path, '0')}
              cells={cells}
              schema={schema.items} // use item schema
              enabled={false}
              uischema={elements}
              renderers={renderers}
              data={defaultItem} // show defaults
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!data?.length && emptyValue) {
    const elements = uischema.options?.['detail'];
    return (
      <Box alignItems='center' sx={{ mt: 0, ml: 0 }}>
        <Grid
          container
          justify='center'
          alignItems='center'
          alignContent='center'
          sx={{ mt: enabled ? 3 : 2, borderBottom: '1px dotted #e0e0e0' }}
        >
          <Grid item xs justify='center' alignItems='center'>
            <JsonFormsDispatch
              path={composePaths(path, '0')}
              cells={cells}
              schema={schema}
              enabled={false}
              uischema={elements}
              renderers={renderers}
              data={{}} // Empty object to show empty field values
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const toRender = Array(data)
    .fill(0)
    .map((_, i) => {
      const shouldScrollTo = autoScroll && i === data - 1;

      return (
        <CardRenderer
          key={i}
          index={i}
          cells={cells}
          schema={schema}
          enabled={enabled}
          boarder={data > 1}
          uischema={uischema}
          renderers={renderers}
          shouldScrollTo={shouldScrollTo}
          path={composePaths(path, `${i}`)}
          onRemove={removeItemsCb(path, [i])}
          lastAddedIndexRef={lastAddedIndexRef}
          totalItems={data}
          minItems={minItems}
        />
      );
    });
  return (
    <Box alignItems='center' sx={{ mt: 0, ml: 0 }}>
      {enabled && isAddable && (
        <Box display='flex' alignItems='center' justifyContent='flex-end'>
          <Tooltip title={t('common.tooltip_add')}>
            <IconButton
              aria-label={t('common.tooltip_add')}
              onClick={addItemCb(path, createDefaultValue(schema))}
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
export const customArrayLayoutTester = rankWith(5, isObjectArrayWithNesting);

const CustomArrayLayout = withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);

export default CustomArrayLayout;
