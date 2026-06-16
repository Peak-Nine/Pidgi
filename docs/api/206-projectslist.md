# projects.list

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-list

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Projects](/docs/api/projects)
  * projects.list



# projects.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/projects.list

Lists all projects that match the optional filters provided.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]

**status** string

**Possible values:** [`open`, `planned`, `running`, `overdue`, `over_budget`, `closed`]

**Example:**`open`

**quotation_ids** string[]

**deal_ids** string[]

**term** string

Filters on the project number, title, customer names, assignee names and owner names. Terms are split on spaces and all terms need to match.

**Example:**`Interesting project`

**customers** object[]

  * Array [

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

  * ]

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

Sorting on `cost` or `margin` is only available to administrators and users with the "Costs on projects" permission

  * Array [

**field** stringrequired

**Possible values:** [`amount_billed`, `amount_paid`, `amount_unbilled`, `cost`, `customer`, `end_date`, `external_budget_spent`, `external_budget`, `internal_budget`, `margin`, `price`, `project_key`, `start_date`, `status`, `time_budget`, `time_estimated`, `time_tracked`, `title`]

**Default value:**`project_key`

**order** Order (string)

**Possible values:** [`asc`, `desc`]

**Default value:**`desc`

  * ]

**includes** string

Comma-separated list of optional includes

**Example:**`legacy_project,custom_fields`




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

**project_key** number

Positive, sequential integer representing the index of the project for the account

**Example:**`123`

**title** string

**Example:**`My project title`

**description** stringnullable

**Example:**`My project description`

**status** string

**Possible values:** [`open`, `closed`]

**billing_method** string

**Possible values:** [`time_and_materials`, `fixed_price`, `non_billable`]

**Example:**`time_and_materials`

**time_budget** objectnullable

Value in seconds, rounded to the nearest minute

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**time_estimated** objectnullable

Combined value of all time estimated by lines linked to project, value in seconds, rounded to the nearest minute.

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**time_tracked** objectnullable

**value** number

**Example:**`60`

**unit** string

**Possible values:** [`seconds`]

**Example:**`seconds`

**amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**amount_unbilled** objectnullable

Price of the project minus the amount billed.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**amount_paid** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

Also known as "budget". Value set by user to compare with price.

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget_spent** objectnullable

Simulated price if billing method were time_and_materials (dependent on type).

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

**start_date** stringnullable

**Example:**`2022-02-23`

**end_date** stringnullable

**Example:**`2022-02-28`

**company_entity** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**owners** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**color** Color (string)

**Possible values:** [`#00B2B2`, `#008A8C`, `#992600`, `#ED9E00`, `#D157D3`, `#A400B2`, `#0071F2`, `#004DA6`, `#64788F`, `#C0C0C4`, `#82828C`, `#1A1C20`]

**Example:**`#00B2B2`

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

**customers** object[]

  * Array [

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

  * ]

**deals** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**quotations** object[]

  * Array [

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

  * ]

**legacy_project** objectnullable

Only included if `legacy_project` is in the optional includes. `null` if there is no corresponding legacy project

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`project`

**custom_fields** object[]

Only included with request parameter `includes=custom_fields`

  * Array [

**definition** object

**type** string

**Example:**`customFieldDefinition`

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * numbers
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

For multiple selection fields

**Example:**`foo`

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

For related Teamleader objects

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

  * ]

**meta** object

Only included with request parameter `includes=pagination`

**page** object

**size** number

**Example:**`10`

**number** number

**Example:**`2`

**matches** number

**Example:**`12`



    
    
    {  
      "data": [  
        {  
          "id": "49b403be-a32e-0901-9b1c-25214f9027c6",  
          "project_key": 123,  
          "title": "My project title",  
          "description": "My project description",  
          "status": "open",  
          "billing_method": "time_and_materials",  
          "time_budget": {  
            "value": 43200,  
            "unit": "seconds"  
          },  
          "time_estimated": {  
            "value": 43200,  
            "unit": "seconds"  
          },  
          "time_tracked": {  
            "value": 43200,  
            "unit": "seconds"  
          },  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "amount_unbilled": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "amount_paid": {  
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
          "start_date": "2022-02-23",  
          "end_date": "2022-02-28",  
          "company_entity": {  
            "type": "department",  
            "id": "0d0dec5a-7096-4009-be37-07eab117db07"  
          },  
          "owners": [  
            {  
              "type": "user",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            }  
          ],  
          "color": "#00B2B2",  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "auto_assigned"  
            }  
          ],  
          "customers": [  
            {  
              "type": "contact",  
              "id": "1106f231-0464-41b7-8b0b-19451af81afe"  
            }  
          ],  
          "deals": [  
            {  
              "type": "deal",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            }  
          ],  
          "quotations": [  
            {  
              "type": "quotation",  
              "id": "a7f15c40-3b65-09ae-9f1b-d55786bc7b01"  
            }  
          ],  
          "legacy_project": {  
            "type": "project",  
            "id": "624ca743-8998-4f8c-add1-c427bb022166"  
          },  
          "custom_fields": [  
            {  
              "definition": {  
                "type": "customFieldDefinition",  
                "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
              },  
              "value": "092980616"  
            }  
          ]  
        }  
      ],  
      "meta": {  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 10  
      }  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "49b403be-a32e-0901-9b1c-25214f9027c6",  
          "project_key": 123,  
          "title": "My project title",  
          "description": "My project description",  
          "status": "open",  
          "billing_method": "time_and_materials",  
          "time_budget": {  
            "value": 43200,  
            "unit": "seconds"  
          },  
          "time_estimated": {  
            "value": 43200,  
            "unit": "seconds"  
          },  
          "time_tracked": {  
            "value": 43200,  
            "unit": "seconds"  
          },  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "amount_unbilled": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "amount_paid": {  
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
          "start_date": "2022-02-23",  
          "end_date": "2022-02-28",  
          "company_entity": {  
            "type": "department",  
            "id": "0d0dec5a-7096-4009-be37-07eab117db07"  
          },  
          "owners": [  
            {  
              "type": "user",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            }  
          ],  
          "color": "#00B2B2",  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "auto_assigned"  
            }  
          ],  
          "customers": [  
            {  
              "type": "contact",  
              "id": "1106f231-0464-41b7-8b0b-19451af81afe"  
            }  
          ],  
          "deals": [  
            {  
              "type": "deal",  
              "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
            }  
          ],  
          "quotations": [  
            {  
              "type": "quotation",  
              "id": "a7f15c40-3b65-09ae-9f1b-d55786bc7b01"  
            }  
          ],  
          "legacy_project": {  
            "type": "project",  
            "id": "624ca743-8998-4f8c-add1-c427bb022166"  
          },  
          "custom_fields": [  
            {  
              "definition": {  
                "type": "customFieldDefinition",  
                "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1"  
              },  
              "value": "092980616"  
            }  
          ]  
        }  
      ],  
      "meta": {  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 10  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/projects.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n      \"46156648-87c6-478d-8aa7-1dc3a00daca4\"\n    ],\n    \"status\": \"open\",\n    \"quotation_ids\": [\n      \"132c7189-6e49-420c-889c-23267ce70660\",\n      \"cd740bde-d317-4c97-bec0-76bfad903a1e\"\n    ],\n    \"deal_ids\": [\n      \"7ea73287-9f87-4b2b-b6f8-866b12b7364a\",\n      \"68f8bb28-e5d0-4ee2-b269-1dbeeda5bdcc\"\n    ],\n    \"term\": \"Interesting project\",\n    \"customers\": [\n      {\n        \"type\": \"contact\",\n        \"id\": \"1106f231-0464-41b7-8b0b-19451af81afe\"\n      }\n    ]\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"amount_billed\"\n    }\n  ],\n  \"includes\": \"legacy_project,custom_fields\"\n}", null, "application/json");  
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
          "46156648-87c6-478d-8aa7-1dc3a00dacab",
          "46156648-87c6-478d-8aa7-1dc3a00daca4"
        ],
        "status": "open",
        "quotation_ids": [
          "132c7189-6e49-420c-889c-23267ce70660",
          "cd740bde-d317-4c97-bec0-76bfad903a1e"
        ],
        "deal_ids": [
          "7ea73287-9f87-4b2b-b6f8-866b12b7364a",
          "68f8bb28-e5d0-4ee2-b269-1dbeeda5bdcc"
        ],
        "term": "Interesting project",
        "customers": [
          {
            "type": "contact",
            "id": "1106f231-0464-41b7-8b0b-19451af81afe"
          }
        ]
      },
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "amount_billed"
        }
      ],
      "includes": "legacy_project,custom_fields"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
