# Industrial Edge Video Story Board


## What do we want to accomplish?
* Show Red Hat Operators being deployed
* Show available Red Hat Pipelines for the Industrial Edge pattern
* Show the seed pipeline running and explain what is is doing
* Demonstration of the Red Hat ArgoCD views
* Show the openshift-gitops-server view
* Show the datacenter-gitops-server view
* Show the factory-gitops-server view


## How to deliver the video demonstration
We will create a multi-video series for the Industrial Edge pattern.  The first is a basic Red Hat validated patterns video that gives an overview of why validated patterns, our goals and the value of validated patterns.

The second video will go deeper into the Industrial Edge validated pattern and get into how to describe a Datacenter and Edge environment using the validated patterns construct.

## Script details

### How to deploy Industrial Edge Script
Clip 1:
      * Red Hat Intro splash
Clip 2:
Industrial Edge Deployment Video
Speaker Introduction “Hi all, my name is <name> Lester Claudio and I am a <title>Senior Principal Software Engineer on the Eco Engineering team here at Red Hat. Today we will be showing you a video on how to deploy the Industrial Edge  Red Hat validated pattern on an existing OpenShift cluster.”
The Areas that we will cover on this video are:
First Quick overview of our deployment environment.
Next we will go over the prerequisites needed before deploying any validated pattern.
Followed by Tools that you will need to deploy the Industrial Edge pattern.
And finally a demonstration on how to deploy the Industrial Edge pattern.


Let’s get started. 
Clip 3:
What are Red Hat validated patterns?  Red Hat validated patterns are detailed deployments created for different edge use cases. These pre-defined edge computing configurations bring together the Red Hat portfolio and technology ecosystem to help you stand up your edge architecture faster.
You can explore our validated patterns implementations by navigating to our Red Hat validated patterns web page.  This will give you valuable information on why we use validated patterns and what they offer.

Clip 4:
Now that you have an idea what a validated pattern is, and where to go to get information about our validated patterns, let’s talk a bit about what you will see next.
We will be deploying the Industrial Edge validated pattern onto an OpenShift Cluster that was deployed on the AWS Cloud.
It is important to know that this validated pattern has also been deployed, and tested, on Google Cloud and Azure.  
The common denominator on each of these environments is the deployed OpenShift Cluster environment.  
There are a few prerequisite tools that you will need in order to install and deploy the Industrial Edge pattern. 
As we mentioned before, we assume that you have deployed an OpenShift Cluster on a target Cloud environment. 
At a minimum you will need to install the following tools on your local machine to deploy the Industrial Edge pattern.
podman - Podman is a daemonless, open source, Linux native tool designed to make it easy to find, run, build, share and deploy applications using Open Containers Initiative (OCI) Containers and Container Images.
Each Validated Pattern will have a pattern.sh script that will assist in the deployment of the pattern by deploying the Utility Container using podman.
The container image includes all the necessary tools to deploy a pattern.
We recommend using the Utility Container to install any of our Validated Patterns.
Optionally you can install the following tools locally on your system if you want to.  We recommend using the pattern.sh script to install the pattern.
helm (optional )- which is the tool that we use to install and manage the Industrial Edge pattern applications using Helm Charts.
GNU make (optional)
and the openshift CLI tool
Other Useful tools that you might want to install on your local machine are:
argocd CLI tool
tkn CLI - Tekton CLI tool
AWS CLI tool

Clip 5
The Industrial Edge pattern uses helm charts to define the set of Kubernetes resources.  If you are not familiar with Helm, it is a tool that streamlines installing and managing Kubernetes applications and uses a packaging format called charts. By using Helm it has allowed us to parameterize a lot of the values that are normally baked into kubernetes manifests. This allows us to apply changes by updating the values files, and apply them, as our kubernetes environment.

There are three main git repositories that are part of the Industrial Edge validated pattern:
https://github.com/hybrid-cloud-patterns/industrial-edge repository This repository is used to deploy, and upgrade, the initial Industrial Edge pattern helm chart to the OpenShift environment. This repository is also used by ArgoCD as the gitops repository to deploy all the kubernetes manifests for the Industrial Edge pattern. 
Next we have https://github.com/hybrid-cloud-patterns/common repository.  This repository contains the Validated Patterns framework which is used to deploy the Industrial Edge components defined in our values files. The common repository is a git subtree that gets included in the Industrial Edge repository.  The goal for this repository is to support not only the Industrial Edge validated pattern but all future Validated Patterns.
Finally we have the https://github.com/hybrid-cloud-patterns/manuela-dev repository This is the repository used by the developers and where the Industrial Edge application source code lives. The Tekton pipelines that are found in the Industrial Edge pattern use this repository to compile and deploy the images created to the OpenShift environment.


For more information on how to deploy the Industrial Edge pattern please refer to the README file in the Industrial Edge pattern git repository.

Clip 6 
There are 4 values files that make up the Industrial Edge validated pattern.
The values files are:
values-datacenter.yaml
values-factory.yaml
values-global.yaml
values-secrets.yaml
NOTE: Use emacs, vi or your favorite editor to update the values-datacenter.yaml file.
values-datacenter.yaml - This file is where you describe the Datacenter environment. One thing to keep in mind is that once you define the components that are part of a Datacenter this file will remain pretty static unless new components are introduced into the environment.
values-factory.yaml - This file is where you describe the Factory, or Edge, environment. 
values-global.yaml - This file contains global parameters that are used throughout the Industrial Edge pattern Helm charts and where you can override their values. 
values-secrets-industrial-edge.yaml - This is the file where we keep our secrets. An important note is that this file should never be committed to your git repository.  The secrets from this file are loaded to our Vault Secrets Management System.  For now we use this file, which lives in your home directory



Now that we have covered the files involved in the Industrial Edge pattern we can now move to the deployment of the Industrial Edge pattern.

Clip 7a RHPDS 

Clip 7
Now let’s finally get to the deployment of the Industrial Edge pattern.
At this point you can follow the instructions found in the README.md file located in the Industrial Edge repository root directory.
We will be working directly on the Linux command line from this point forward.
The first thing is to ensure that we have either exported the KUBECONFIG environment variable to use the correct kubeconfig file for your cluster or use oc login to login to the cluster.

We offer a values-secrets.yaml.template file as an example secrets file in the repository for users to update.  Copy the values-secret.yaml.template to your home directory and name it values-secret-industrial-edge.yaml. For our deployment of the Industrial Edge pattern you will need to fill out the following sections:




NOTE: The values-secrets.yaml file should NEVER be committed to your git repo.

version: "2.0"
secrets:
  - name: imageregistry
    fields:
    # eg. Quay -> Robot Accounts -> Robot Login
    - name: username
      value: claudiol+ops
    - name: password
      value: BMF9S4...NF
    
  - name: git
    fields:
    # Go to: https://github.com/settings/tokens
    - name: username
      value: claudiol
    - name: password
      value: ghp_...4g
    
  - name: aws
    fields:
    - name: aws_access_key_id
      ini_file: ~/.aws/credentials
      ini_key: aws_access_key_id
    - name: aws_secret_access_key
      ini_file: ~/.aws/credentials
      ini_key: aws_secret_access_key



$ ./pattern.sh make install
At this point we will look at the OpenShift console and navigate to the Installed Operators. We should see the Red Hat OpenShift Gitops operator start installing. Once complete we will be able to get the ArgoCD routes so we can see our applications.
Once ArgoCD is installed you will see additional operators being installed. These are the operators that we defined in the values-datacenter.yaml file.  

$ ./pattern.sh make seed
We can wait for all the operators to install and navigate to the Pipelines once the pipelines starts to run.
We can also see that once the Red Hat Pipelines operator gets installed we start seeing ArgoCD apply the Tekton tasks and pipelines that are part of the Industrial Edge pattern. 


Once the pipeline is finished we can now check that the Industrial Edge application has been deployed.
Thank you for your time and we hope that this has been a useful demonstration.










END Backup stuff:
What is Red Hat AMQ Broker/Streams? Red Hat® AMQ is a lightweight, high-performance, robust messaging platform. AMQ Broker is a high-performance messaging implementation based on ActiveMQ Artemis. It uses an asynchronous journal for faster message persistence. AMQ Broker supports multiple languages, protocols, and platforms.
Red Hat AMQ Streams is an enterprise-grade Apache Kafka (event streaming) solution, which enables systems to exchange data at high throughput and low latency.
The Industrial Edge pattern uses messaging to manage the status of IoT devices, such as pumps, that are located on Edge regions publishing their temperature and vibration statistics. These statistics will be collected by the Industrial Edge components and displayed on the Industrial Edge front-end application.


values-datacenter.yaml details

The Datacenter environment is described using the following sections in the values file:
The global section options that will be used to deploy operators as well as sync policies used by ArgoCD. Here’s where you could override any other

global:                                                                                                
          options:                                                                                             
            useCSV: False                                                                                      
            syncPolicy: Automatic                                                                              
            installPlanApproval: Automatic 

The site section defines whether this is a datacenter or an edge site.

        site: 
          name: datacenter
          
          proposedOptions:
            manageGitops: True
            isHubCluster: True

The namespaces section describes the namespaces that the validated pattern needs on the OpenShift Cluster environment.

  namespaces:                                                                                          
  - open-cluster-management                                                                            
  - manuela-ml-workspace                                                                               
  - manuela-tst-all                                                                                    
  - manuela-ci                                                                                         
  - manuela-data-lake-central-s3-store                                                                 
  - manuela-data-lake-central-kafka-cluster


The subscriptions section lists the operators that are needed by the validated pattern:

  subscriptions:                                                                                       
  - name: advanced-cluster-management                                                                  
    namespace: open-cluster-management                                                                 
    channel: release-2.3                                                                               
    csv: advanced-cluster-management.v2.3.2                                                            
                                                                                                       
  - name: seldon-operator                                                                              
    namespace: manuela-ml-workspace                                                                    
    source: community-operators                                                                        
    csv: seldon-operator.v1.7.0                                                                        
                                                                                                       
  - name: opendatahub-operator                                                                         
    source: community-operators                                                                        
    csv: opendatahub-operator.v1.1.0                                                                   
                                                                                                       
  - name: openshift-pipelines-operator-rh                                                              
    csv: redhat-openshift-pipelines.v1.5.1
    
  - name: amq-streams                                                                                  
    namespace: manuela-tst-all                                                                         
    channel: amq-streams-1.7.x                                                                         
    csv: amqstreams.v1.7.1                                                                             
                                                                                                       
  - name: red-hat-camel-k                                                                              
    namespace: manuela-data-lake-central-s3-store                                                      
    channel: 1.4.x                                                                                     
    csv: red-hat-camel-k-operator.v1.4.0                                                               
                                                                                                       
  - name: red-hat-camel-k                                                                              
    namespace: manuela-tst-all                                                                         
    channel: 1.4.x                                                                                     
    csv: red-hat-camel-k-operator.v1.4.0   



Notice that the operator entry can include the target namespace where it should be installed and also the csv, or ClusterServiceVersion, of the operator. If you choose to use the CSV attribute you will need to change the value of useCSV attribute to True.  We recommend setting the useCSV value to false and let the OpenShift operator choose the CSV for you. Also notice that the first entry is for the Red Hat Advanced Cluster Management. We require this entry to be in your Datacenter definition as our patterns use Red Hat ACM to manage other clusters.

The next two sections are related to the ArgoCD environment. We describe projects and applications in the values file that will be deployed into the ArgoCD application instance.
Projects provide a logical grouping of applications, which is useful when Argo CD is used by multiple teams. An ArgoCD Application represents a deployed application instance in an environment.
  projects:
  - datacenter

  applications:
  - name: acm
    namespace: open-cluster-management
    project: datacenter
    path: common/acm

  - name: odh
    namespace: opendatahub
    project: datacenter
    path: charts/datacenter/opendatahub

values-factory.yaml - This file is where you describe the Factory/Edge environment. This file contains the same sections as the ones for the Datacenter but it will probably have less operators since you would only need the operators that directly support the application.
values-global.yaml - This values file contains the Global parameters that can be overriding for the validated pattern. In the case of the Industrial Edge pattern there are parameters that are specific to the git provider (e.g. github.com) so that the pipelines can access the repositories using the git provider authentication. The sections that will need to be update are:
global:
  pattern: industrial-edge

  options:
    useCSV: False
    syncPolicy: Automatic
    installPlanApproval: Automatic

  git:
    provider: github.com
    account: YOURGITHUBACCOUNT
    username: YOURGITHUBACCOUNT
    email: user@redhat.com
    dev_revision: main

  quay:
    provider: quay.io
    account: QUAYUSER

  datacenter:
    clustername: CLUSTERNAME
    domain: DOMAIN

values-secrets.yaml - This is the file where we keep our secrets. There are several ways to keep secrets in OpenShift. We are currently maturing our solution for this. For now we use this file, which lives in your home directory, to keep the Industrial Edge pattern secrets. We offer a values-secrets.yaml template in the repository for users to update.
NOTE: The values-secrets.yaml file should NEVER be commited to you git repo.
secrets:
  # NEVER COMMIT THESE VALUES TO GIT
  enabled: false
  quay:
    # Quay -> Robot Accounts -> Kubernetes Secret -> View
    authToken: 'QUAY TOKEN BASE64'

  git:
    # Go to: https://github.com/settings/tokens
    # Then: echo -n 'your string value' | base64
    accountToken: 'BASE64 USER'
    authToken: 'BASE64 GitHub Token'
    
  aws:
    namespaces:
      - factory-lake
      - manuela-lake
    s3Secret: BASE64 S3 Secret

