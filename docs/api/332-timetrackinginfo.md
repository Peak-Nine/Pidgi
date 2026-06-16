# timeTracking.info

> Source: https://developer.focus.teamleader.eu/docs/api/time-tracking-info

  * [](/)
  * [API Reference](/docs/api)
  * Time Tracking
  * [Time Tracking](/docs/api/time-tracking)
  * timeTracking.info



# timeTracking.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/timeTracking.info

Get information about tracked time.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6caeea11-aa83-4da9-9859-5b62bbf3a476`

**includes** string

Comma-separated list of optional includes

**Example:**`materials,relates_to`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`6caeea11-aa83-4da9-9859-5b62bbf3a476`

**user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**work_type** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**started_on** string

**Example:**`2017-04-26`

**started_at** stringnullable

**Example:**`2017-04-26T10:01:49+00:00`

**ended_at** stringnullable

**Example:**`2017-04-26T11:01:49+00:00`

**duration** number

In seconds

**Example:**`3600`

**description** string

**Example:**`Timer description`

**subject** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `event`, `todo`, `milestone`, `ticket`]

**invoiceable** boolean

**Example:**`true`

**locked** boolean

If true, the freeze time window has passed since creating it

**Example:**`true`

**billing_info** objectnullable

**type** string

**Possible values:** [`invoice`, `prepaid`]

**Example:**`invoice`

**invoice** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**materials** object[]

Only included with request parameter `includes=materials`

  * Array [

**product** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**description** string

**Example:**`Product description`

**unit_price** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**quantity** number

**Example:**`5`

  * ]

**relates_to** object[]

Only included with request parameter `includes=relates_to`

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** TimeTrackingRelatesToTypes (string)

**Possible values:** [`contact`, `company`, `project`, `milestone`, `ticket`, `nextgenProject`, `nextgenProjectGroup`]

  * ]

**hourly_rate** object

Only included for users with access to invoicing

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**meta** object

**updatable** boolean

If true, the current user can update the entry even if it is locked

**Example:**`true`



    
    
    {  
      "data": {  
        "id": "6caeea11-aa83-4da9-9859-5b62bbf3a476",  
        "user": {  
          "type": "user",  
          "id": "56bc6b39-b722-42f5-9ea7-acea4814d7dd"  
        },  
        "work_type": {  
          "type": "workType",  
          "id": "d980dbc6-944e-47fc-bf16-2ed7d5a71889"  
        },  
        "started_on": "2017-04-26",  
        "started_at": "2017-04-26T10:01:49+00:00",  
        "ended_at": "2017-04-26T11:01:49+00:00",  
        "duration": 3600,  
        "description": "Timer description",  
        "subject": {  
          "type": "milestone",  
          "id": "5883723a-b5aa-4c9d-a02b-ec0dd25f6ca2"  
        },  
        "invoiceable": true,  
        "locked": true,  
        "billing_info": {  
          "type": "invoice",  
          "invoice": {  
            "type": "invoice",  
            "id": "b2b4b2b4-4b2b-4b2b-4b2b-4b2b4b2b4b2b"  
          }  
        },  
        "materials": [  
          {  
            "product": {  
              "type": "product",  
              "id": "e2314517-3cab-4aa9-8471-450e73449040"  
            },  
            "description": "Product description",  
            "unit_price": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "quantity": 5  
          }  
        ],  
        "relates_to": [  
          {  
            "type": "contact",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          }  
        ],  
        "hourly_rate": {  
          "amount": 123.3,  
          "currency": "EUR"  
        }  
      },  
      "meta": {  
        "updatable": true  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "6caeea11-aa83-4da9-9859-5b62bbf3a476",  
        "user": {  
          "type": "user",  
          "id": "56bc6b39-b722-42f5-9ea7-acea4814d7dd"  
        },  
        "work_type": {  
          "type": "workType",  
          "id": "d980dbc6-944e-47fc-bf16-2ed7d5a71889"  
        },  
        "started_on": "2017-04-26",  
        "started_at": "2017-04-26T10:01:49+00:00",  
        "ended_at": "2017-04-26T11:01:49+00:00",  
        "duration": 3600,  
        "description": "Timer description",  
        "subject": {  
          "type": "milestone",  
          "id": "5883723a-b5aa-4c9d-a02b-ec0dd25f6ca2"  
        },  
        "invoiceable": true,  
        "locked": true,  
        "billing_info": {  
          "type": "invoice",  
          "invoice": {  
            "type": "invoice",  
            "id": "b2b4b2b4-4b2b-4b2b-4b2b-4b2b4b2b4b2b"  
          }  
        },  
        "materials": [  
          {  
            "product": {  
              "type": "product",  
              "id": "e2314517-3cab-4aa9-8471-450e73449040"  
            },  
            "description": "Product description",  
            "unit_price": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "quantity": 5  
          }  
        ],  
        "relates_to": [  
          {  
            "type": "contact",  
            "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
          }  
        ],  
        "hourly_rate": {  
          "amount": 123.3,  
          "currency": "EUR"  
        }  
      },  
      "meta": {  
        "updatable": true  
      }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/timeTracking.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"6caeea11-aa83-4da9-9859-5b62bbf3a476\",\n  \"includes\": \"materials,relates_to\"\n}", null, "application/json");  
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

Body required

  * Example (from schema)
  * Example


    
    
    {
      "id": "6caeea11-aa83-4da9-9859-5b62bbf3a476",
      "includes": "materials,relates_to"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
