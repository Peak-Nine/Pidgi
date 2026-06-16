# projectGroups.list

> Source: https://developer.focus.teamleader.eu/docs/api/project-groups-list

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Groups](/docs/api/groups)
  * projectGroups.list



# projectGroups.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projectGroups.list

Lists all the groups that match the optional filters provided.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**project_id** string

**Example:**`01859b27-1525-7372-bd40-26a6363c8bfe`




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

**Example:**`0185a0af-97a6-7f44-8aec-254d8daf72f3`

**project** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**title** string

**Example:**`Website frontpage`

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

**billing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `parent_fixed_price`, `non_billable`]

**Example:**`time_and_materials`

**billing_status** BillingStatus (string)

**Possible values:** [`not_billable`, `not_billed`, `partially_billed`, `fully_billed`]

**Example:**`not_billable`

**amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget_spent** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**calculated_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin_percentage** numbernullable

`null` if the user does not have access to "Costs on projects"

**assignees** object[]

  * Array [

**assignee** object

**type** string

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**assign_type** string

**Possible values:** [`manual`, `auto_assigned`, `manual_and_auto_assigned`]

**Example:**`auto_assigned`

  * ]

**start_date** stringnullable

**Example:**`2023-01-18`

**end_date** stringnullable

**Example:**`2023-03-22`

**time_estimated** objectnullable

The total of all time estimated for every item in this group. Value in seconds, rounded to the nearest minute.

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**time_tracked** objectnullable

The total of all time tracked for every item in this group.

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "0185a0af-97a6-7f44-8aec-254d8daf72f3",  
          "project": {  
            "type": "nextgenProject",  
            "id": "018536c0-bf23-77eb-81f5-10e87cad50bc"  
          },  
          "title": "Website frontpage",  
          "color": "#00B2B2",  
          "billing_method": "time_and_materials",  
          "billing_status": "not_billable",  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget_spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "internal_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "calculated_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin_percentage": null,  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "auto_assigned"  
            }  
          ],  
          "start_date": "2023-01-18",  
          "end_date": "2023-03-22",  
          "time_estimated": {  
            "value": 28800,  
            "unit": "seconds"  
          },  
          "time_tracked": {  
            "value": 21100,  
            "unit": "seconds"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "0185a0af-97a6-7f44-8aec-254d8daf72f3",  
          "project": {  
            "type": "nextgenProject",  
            "id": "018536c0-bf23-77eb-81f5-10e87cad50bc"  
          },  
          "title": "Website frontpage",  
          "color": "#00B2B2",  
          "billing_method": "time_and_materials",  
          "billing_status": "not_billable",  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget_spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "internal_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "calculated_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin_percentage": null,  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "auto_assigned"  
            }  
          ],  
          "start_date": "2023-01-18",  
          "end_date": "2023-03-22",  
          "time_estimated": {  
            "value": 28800,  
            "unit": "seconds"  
          },  
          "time_tracked": {  
            "value": 21100,  
            "unit": "seconds"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projectGroups.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"0185a0af-97a6-7f44-8aec-254d8daf72f3\",\n      \"0185a0c3-b791-7629-8361-d60f3c0d7ce2\"\n    ],\n    \"project_id\": \"01859b27-1525-7372-bd40-26a6363c8bfe\"\n  }\n}", null, "application/json");  
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
          "0185a0af-97a6-7f44-8aec-254d8daf72f3",
          "0185a0c3-b791-7629-8361-d60f3c0d7ce2"
        ],
        "project_id": "01859b27-1525-7372-bd40-26a6363c8bfe"
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
