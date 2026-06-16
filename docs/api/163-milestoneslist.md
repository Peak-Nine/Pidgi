# milestones.list

> Source: https://developer.focus.teamleader.eu/docs/api/legacy-milestones-list

  * [](/)
  * [API Reference](/docs/api)
  * Legacy Projects
  * [Legacy Milestones](/docs/api/legacy-milestones)
  * milestones.list



# milestones.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/milestones.list

Get a list of project milestones.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**project_id** string

**Example:**`082e6289-30c5-45ad-bcd0-190b02d21e81`

**status** string

**Possible values:** [`open`, `closed`]

**due_before** string

**Example:**`2017-01-01`

**due_after** string

**Example:**`2017-01-01`

**term** string

Searches for a term in title

**Example:**`coffee`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`starts_on`, `due_on`]

**Default value:**`due_on`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`asc`

  * ]




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

**Example:**`cfb4146d-06be-41f1-bb39-aa3c929c71dc`

**project** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**starts_on** stringnullable

**Example:**`2017-01-01`

**due_on** string

**Example:**`2018-01-01`

**name** string

**Example:**`Initial setup`

**responsible_user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**status** string

**Possible values:** [`open`, `closed`]

**invoicing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `non_invoiceable`]

**Example:**`time_and_materials`

**depends_on** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**dependency_for** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**actuals** object

Only accessible for administrators of the project this milestone belongs to

**billable_amount** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**costs** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**result** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**budget** object

Only accessible for administrators of the project this milestone belongs to

**provided** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**spent** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**remaining** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**allocated** objectnullable

The amount of money still expected to be spent. This is null if there is not enough data to calculate

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**forecasted** objectnullable

A prediction of the spent budget upon milestone completion. This is null if there is not enough data to calculate

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "cfb4146d-06be-41f1-bb39-aa3c929c71dc",  
          "project": {  
            "type": "project",  
            "id": "944534fb-15f1-4eea-aab1-82a427aa2d0d"  
          },  
          "starts_on": "2017-01-01",  
          "due_on": "2018-01-01",  
          "name": "Initial setup",  
          "responsible_user": {  
            "type": "user",  
            "id": "e1240972-6cfc-4549-b49c-edda7568cc48"  
          },  
          "status": "open",  
          "invoicing_method": "time_and_materials",  
          "depends_on": {  
            "type": "milestone",  
            "id": "0488d792-ba9b-059f-bd57-bea75d3f4f4e"  
          },  
          "dependency_for": [  
            {  
              "type": "milestone",  
              "id": "b71ff11f-074e-0705-9450-589342af4f4f"  
            }  
          ],  
          "actuals": {  
            "billable_amount": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "costs": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "result": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "budget": {  
            "provided": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "spent": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "remaining": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "allocated": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "forecasted": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "cfb4146d-06be-41f1-bb39-aa3c929c71dc",  
          "project": {  
            "type": "project",  
            "id": "944534fb-15f1-4eea-aab1-82a427aa2d0d"  
          },  
          "starts_on": "2017-01-01",  
          "due_on": "2018-01-01",  
          "name": "Initial setup",  
          "responsible_user": {  
            "type": "user",  
            "id": "e1240972-6cfc-4549-b49c-edda7568cc48"  
          },  
          "status": "open",  
          "invoicing_method": "time_and_materials",  
          "depends_on": {  
            "type": "milestone",  
            "id": "0488d792-ba9b-059f-bd57-bea75d3f4f4e"  
          },  
          "dependency_for": [  
            {  
              "type": "milestone",  
              "id": "b71ff11f-074e-0705-9450-589342af4f4f"  
            }  
          ],  
          "actuals": {  
            "billable_amount": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "costs": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "result": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          },  
          "budget": {  
            "provided": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "spent": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "remaining": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "allocated": {  
              "amount": 123.3,  
              "currency": "EUR"  
            },  
            "forecasted": {  
              "amount": 123.3,  
              "currency": "EUR"  
            }  
          }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/milestones.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"bbbfe0da-e692-4ee3-9d3d-0716808d6523\",\n      \"722e1eb9-53d5-4b8c-9d17-154dcc65c610\"\n    ],\n    \"project_id\": \"082e6289-30c5-45ad-bcd0-190b02d21e81\",\n    \"due_before\": \"2017-01-01\",\n    \"due_after\": \"2017-01-01\",\n    \"term\": \"coffee\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"starts_on\"\n    }\n  ]\n}", null, "application/json");  
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

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "ids": [
          "bbbfe0da-e692-4ee3-9d3d-0716808d6523",
          "722e1eb9-53d5-4b8c-9d17-154dcc65c610"
        ],
        "project_id": "082e6289-30c5-45ad-bcd0-190b02d21e81",
        "due_before": "2017-01-01",
        "due_after": "2017-01-01",
        "term": "coffee"
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "starts_on"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
