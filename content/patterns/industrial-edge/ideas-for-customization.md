---
title: Ideas for Customization
weight: 60
aliases: /industrial-edge/ideas-for-customization/
---

# Ideas for Customization

# Why change it?

One of the major goals of the Red Hat patterns development process is to create modular, customizable demos. The Industrial Edge demonstration includes multiple, simulated, IoT devices publishing their temperature and vibration telemetry to our data center and ultimately persisting the data into an AWS S3 storage service bucket which we call the Data Lake. All of this is done using our Red Hat certified products running on OpenShift.

This demo in particular can be customized in a number of ways that might be very interesting - and here are some starter ideas with some instructions on exactly what and where changes would need to be made in the pattern to accommodate those changes.

# HOWTO Forking the Industrial Edge repository to your github account

Hopefully we are all familiar with GitHub.  If you are not GitHub is a code hosting platform for version control and collaboration. It lets you and others work together on projects from anywhere.  Our Industrial Edge GitOps repository is available in our [Validated Patterns GitHub](https://github.com/validatedpatterns "Validated Patterns Homepage") organization.

To fork this repository, and deploy the Industrial Edge pattern, follow the steps found in our [Getting Started](https://validatedpatterns.io/industrial-edge/getting-started "Industrial Edge Getting Started Guide") section.  This will allow you to follow the next few HOWTO guides in this section.

Our sensors have been configured to send data relating to the vibration of the devices.  To show the power of GitOps, and keeping state in a git repository, we can make a change to the config map of one of the sensors to detect and report data on temperature. This is done via a variable called *SENSOR_TEMPERATURE_ENABLED* that is initially set to false.  Setting this variable to true will trigger the GitOps engine to synchronize the application, restart the machine sensor and apply the change.

There are two environments in the Industrial Edge demonstration:

* The staging environment that lives in the *manuela-tst-all* namespace
* The production environment which lives in the *stormshift* namespaces

As an operator you would first make changes to the staging first.  Here are the steps to see how the GitOps engine does it's magic. These changes will be reflected in the staging environment Line Dashboard UI in the *manuela-tst-all* namespace.

* The config maps in question live in the charts/datacenter/manuela-tst/templates/machine-sensor directory
* There are two config maps that we can change:
  * machine-sensor-1-configmap.yaml
  * machine-sensor-2-configmap.yaml
* Change the following variable in *machine-sensor-1-configmap.yaml*
  * **SENSOR_TEMPERATURE_ENABLED: "true"**
* Make sure you commit the changes to **git**
  * **git add machine-sensor-1-configmap.yaml**
  * **git commit -m "Changed SENSOR_TEMPERATURE_ENABLED to true"**
  * **git push**
* Now you can go to the Line Dashboard application and see how the UI shows the temperature for that device.  You can find the route link by:
  * Change the Project context to manuela-tst-all
  * Navigate to Networking->Routes
  * Press on the Location link to see navigate to the UI.

# HOWTO Applying the pattern to a new use case

There are a lot of IoT devices that we could add to this pattern.  In today's world we have IoT devices that perform different functions and these devices are connected to a network where they have the ability of sending telemetry data to other devices or a central data center.  In this particular use case we address an Industrial sector but what about applying this use case to other sectors such as Automotive or Delivery service companies?

If we take the Deliver Service use case, and apply it to this pattern, we would have to take into account the following aspects:

* The main components in the pattern architecture can be used as is.
  * The broker and kafka components are the vehicles for the streaming data coming from the devices.
* The IoT sensor software would have to be developed.  The IoT devices will now be mobile so that presents a few challenges tracking the devices in part due to spotty connectivity to send the data stream.
* The number of IoT devices to be tracked will increase depending on the fleet of delivery trucks out in the field.
  * Scalability will be an important aspect for the pattern to be able to handle.
* A new AI/ML model would have to be developed to "learn" through the analysis of the data stream from the IoT devices.

The idea is that this pattern can be used for other use cases keeping the main components in place. The components that would be new to the pattern are: IoT device code, AI/ML models, and specific kafka/broker topics to keep track of.

# Next Steps

What ideas for customization do you have? Can you use this pattern for other use cases?  Let us know through our feedback link below.

[Help & Feedback](https://groups.google.com/g/validatedpatterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/validatedpatterns/ansible-edge-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
