---
title: Application Demos
weight: 30
aliases: /retail/application/
---

# Demonstrating Retail example applications

## Background

Up until now the Retail validated pattern has focused primarily on successfully deploying the architectural pattern. Now it is time to see the actual applications running as we have deployed them.

If you have already deployed the hub cluster, then you have already seen several applications deployed in the OpenShift GitOps console. If you haven't done this then we recommend you deploy the hub after you have setup the Quay repositories described below.

## Ordering Items at the Coffeeshop

The easiest way to get to the coffeeshop store page is from the OpenShift Console Menu Landing Page entry:

[![retail-v1-console-menu](/images/retail/retail-v1-console-menu.png)](/images/retail/retail-v1-console-menu.png)

Clicking on the Quarkus Coffeeshop Landing Page link will bring you to this page:

[![retail-v1-landing-page](/images/retail/retail-v1-landing-page.png)](/images/retail/retail-v1-landing-page.png)

And clicking on either the "Store Web Page" or "TEST Store Web Page" links will bring you to a screen that looks like this:

[![retail-v1-store-page](/images/retail/retail-v1-store-page.png)](/images/retail/retail-v1-store-page.png)

*NOTE*: The applications are initially identical. The "TEST" site is deployed to the `quarkuscoffeeshop-demo` namespace; the regular Store site is deployed to the `quarkuscoffeeshop-store` namespace.

Each store requires supporting services, in PostgreSQL and Kafka. In our pattern, PostgreSQL is provided by the Crunchy PostgreSQL operator, and Kafka is provided by the Red Hat AMQ Streams operator. Each instance, the regular instance and the TEST instance, has its own instance of each of these supporting services it uses.

To order, click on the "Place an Order" button on the front page. The menu should look like this:

[![retail-v1-store-web-menu](/images/retail/retail-v1-store-web-menu.png)](/images/retail/retail-v1-store-web-menu.png)

Click the "Add" button next to a menu item; the item name will appear. Add a name for the order:

[![retail-v1-order-p1](/images/retail/retail-v1-order-p1.png)](/images/retail/retail-v1-order-p1.png)

You can add as many orders as you want. On your last item, click the "Place Order" button on the item dialog:

[![retail-v1-place-order](/images/retail/retail-v1-place-order.png)](/images/retail/retail-v1-place-order.png)

As the orders are serviced by the barista and kitchen services, you can see their status in the "Orders" section of the page:

[![retail-v1-orders-status](/images/retail/retail-v1-orders-status.png)](/images/retail/retail-v1-orders-status.png)
