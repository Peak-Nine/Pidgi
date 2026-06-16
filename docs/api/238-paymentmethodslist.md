# paymentMethods.list

> Source: https://developer.focus.teamleader.eu/docs/api/payment-methods-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Payment Methods](/docs/api/payment-methods)
  * paymentMethods.list



# paymentMethods.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/paymentMethods.list

Get a list of payment methods.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**Example:**`["92296ad0-2d61-4179-b174-9f354ca2157f","53635682-c382-4fbf-9fd9-9506ca4fbcdd"]`

**status** string[]

Filters on status

**Possible values:** [`active`, `archived`]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`49b403be-a32e-0901-9b1c-25214f9027c6`

**name** string

**Example:**`Coupons`

**status** stringrequired

**Possible values:** [`active`, `archived`]

**Example:**`active`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "49b403be-a32e-0901-9b1c-25214f9027c6",  
          "name": "Coupons",  
          "status": "active"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "49b403be-a32e-0901-9b1c-25214f9027c6",  
          "name": "Coupons",  
          "status": "active"  
        }  
      ]  
    }  
    

#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/paymentMethods.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"92296ad0-2d61-4179-b174-9f354ca2157f\",\n      \"53635682-c382-4fbf-9fd9-9506ca4fbcdd\"\n    ],\n    \"status\": [\n      \"active\"\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body
    
    
    {
      "filter": {
        "ids": [
          "92296ad0-2d61-4179-b174-9f354ca2157f",
          "53635682-c382-4fbf-9fd9-9506ca4fbcdd"
        ],
        "status": [
          "active"
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
