import * as React from "react";
import { FormEvent } from "react";
import { Button, Card, Form, message } from "antd";
import { observer } from "mobx-react";
import { CarManagement } from "./CarManagement";
import { FormComponentProps } from "antd/lib/form";
import { Link, Redirect } from "react-router-dom";
import { IReactionDisposer, observable, reaction } from "mobx";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps
} from "react-intl";

import {
  collection,
  Field,
  instance,
  checkConstraintViolations,
  clearErrorsFromPreviousSubmission,
  constraintViolationsToFormFields,
  withLocalizedForm
} from "@cuba-platform/react";

import "../../app/App.css";
import { Car } from "../../cuba/entities/scr$Car";

import { Garage } from "../../cuba/entities/scr$Garage";

type Props = FormComponentProps & EditorProps;

type EditorProps = {
  entityId: string;
};

@observer
class CarEditComponent extends React.Component<Props & WrappedComponentProps> {
  dataInstance = instance<Car>(Car.NAME, {
    view: "car-edit",
    loadImmediately: false
  });

  garagesDc = collection<Garage>(Garage.NAME, { view: "_minimal" });

  @observable
  updated = false;
  reactionDisposer: IReactionDisposer;

  fields = ["manufacturer", "model", "wheelOnRight", "garage"];

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.warn(
          this.props.intl.formatMessage({
            id: "management.editor.validationError"
          })
        );
        return;
      }
      this.dataInstance
        .update(this.props.form.getFieldsValue(this.fields))
        .then(() => {
          message.success(
            this.props.intl.formatMessage({ id: "management.editor.success" })
          );
          this.updated = true;
        })
        .catch((e: any) => {
          if (e.response && typeof e.response.json === "function") {
            e.response.json().then((response: any) => {
              clearErrorsFromPreviousSubmission(this.props.form);
              const constraintViolations: Map<
                string,
                string[]
              > = checkConstraintViolations(response);
              if (constraintViolations.size > 0) {
                this.props.form.setFields(
                  constraintViolationsToFormFields(
                    constraintViolations,
                    this.props.form
                  )
                );
                message.warn(
                  this.props.intl.formatMessage({
                    id: "management.editor.validationError"
                  })
                );
              } else {
                message.error(
                  this.props.intl.formatMessage({
                    id: "management.editor.error"
                  })
                );
              }
            });
          } else {
            message.error(
              this.props.intl.formatMessage({ id: "management.editor.error" })
            );
          }
        });
    });
  };

  render() {
    if (this.updated) {
      return <Redirect to={CarManagement.PATH} />;
    }

    const { status } = this.dataInstance;

    return (
      <Card className="page-layout-narrow">
        <Form onSubmit={this.handleSubmit} layout="vertical">
          <Field
            entityName={Car.NAME}
            propertyName="manufacturer"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{
              rules: [{ required: true }]
            }}
          />

          <Field
            entityName={Car.NAME}
            propertyName="model"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{}}
          />

          <Field
            entityName={Car.NAME}
            propertyName="wheelOnRight"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            getFieldDecoratorOpts={{
              valuePropName: "checked"
            }}
          />

          <Field
            entityName={Car.NAME}
            propertyName="garage"
            form={this.props.form}
            formItemOpts={{ style: { marginBottom: "12px" } }}
            optionsContainer={this.garagesDc}
            getFieldDecoratorOpts={{}}
          />

          <Form.Item style={{ textAlign: "center" }}>
            <Link to={CarManagement.PATH}>
              <Button htmlType="button">
                <FormattedMessage id="management.editor.cancel" />
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              disabled={status !== "DONE" && status !== "ERROR"}
              loading={status === "LOADING"}
              style={{ marginLeft: "8px" }}
            >
              <FormattedMessage id="management.editor.submit" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }

  componentDidMount() {
    if (this.props.entityId !== CarManagement.NEW_SUBPATH) {
      this.dataInstance.load(this.props.entityId);
    } else {
      this.dataInstance.setItem(new Car());
    }
    this.reactionDisposer = reaction(
      () => {
        return this.dataInstance.item;
      },
      () => {
        this.props.form.setFieldsValue(
          this.dataInstance.getFieldValues(this.fields)
        );
      }
    );
  }

  componentWillUnmount() {
    this.reactionDisposer();
  }
}

export default injectIntl(
  withLocalizedForm<EditorProps>({
    onValuesChange: (props: any, changedValues: any) => {
      // Reset server-side errors when field is edited
      Object.keys(changedValues).forEach((fieldName: string) => {
        props.form.setFields({
          [fieldName]: {
            value: changedValues[fieldName]
          }
        });
      });
    }
  })(CarEditComponent)
);