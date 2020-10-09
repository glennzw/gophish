var library = {}
var domains = ["cndserver.com", "uptime-hosting.co.uk", "server-content-delivery.co.uk"]

$( document ).ready(function() {

    $('body').on('click','img',function(){
        url = $(this).attr('src')
        base = url.substr(0,url.lastIndexOf('/')+1)
        
        imgname = url.split("/")[url.split("/").length-1]
        if ( imgname == 'email.png'){
            $(this).attr('src', base + 'landing.png'); 
        } else if ( imgname == 'landing.png') {
            $(this).attr('src', base + 'email.png');
        }    
    }) 
});

function dismiss() {
    $("#name").val("")
    $("#modal\\.flashes").empty()
}

async function test(name){
    item = library[name]

    const { value: formValues } = await Swal.fire({
        type: "info",
        title: "Test " + name + " Campaign",
        showCancelButton: true,
        confirmButtonText: "Send!",
        reverseButtons: true,     
        allowOutsideClick: false,   
        html:
          '<input id="swal-email" class="swal2-input" placeholder="Email address to send the campaign to">',
         
        focusConfirm: false,
        preConfirm: () => {
            email = document.getElementById('swal-email').value
            if ( !(/^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,24}$/.test(email)) ) { //Emai validation taken from swal code
                Swal.showValidationMessage('Please enter a valid email address')
            }
          return [
            email
          ]
        }
      })
      
      if (formValues) {
          //Create a temporary group with the email, send campaign, delete group, link to campaign url
          email = formValues[0]
          randomDomain = domains[Math.floor(Math.random() * domains.length)]; 
          listener = "https://" + name.replace(/\s/g, '').toLowerCase() + "." + randomDomain
          rnd = Math.floor(Math.random() * (+9999 - +1000)) + +1000;
          groupname = "_testCampaignGroup" + rnd
          campaignname = "Test " + name + " Campaign-" + rnd
          group = {"name":groupname,"targets":[{"first_name":"Bobby","last_name":"Phisher","email":formValues[0],"position":"Space Janitor"}]}
          api.groups.post(group)
          .success(function (data) {
                groupid = data.id
                //Next make campaign
                campaign = {  
                    "name": campaignname,
                    "template":{  "name": name},
                    "url":listener,
                    "page":{"name":name},
                    "smtp":{"name":name},
                    "groups":[{"name":groupname}]
                }
                api.campaigns.post(campaign)
                .success(function (data) {
                    //Delete temp group
                    api.groupId.delete(groupid)
                    .success(function (msg) {
                        //All good
                    })
                    .error(function (data) {
                        console.log(data.responseJSON.message)
                    })
                    Swal.fire({type:"success", title:"Test campaign sent!"})
                })
                .error(function (data) {
                    Swal.fire("Error: " + data.responseJSON.message)
                })

                
          })//end success
          .error(function (data) {
              Swal.fire("Error: " + data.responseJSON.message)
          })
      }
}

function launch(name) {
    item = library[name]
    
    //Get Targets
    var targets = {}
    api.groups.get()
    .success(function (groups) {
        if (groups.length == 0) {
            return false;
        } else {
            $.map(groups, function (obj) {
                targets[obj.name] = obj.name;
            });
        }
    }) .error(function () {
        $("#loading").hide()
        errorFlash("Error fetching targets")
    })

    //Get campaign names
    api.campaigns.summary()
    .success(function (data) {

        campaigns={}
        $.each(data.campaigns, function( index, value ) {
            campaigns[value.name] = value.name
          });
    })
    .error(function () {
        $("#loading").hide()
        errorFlash("Error fetching campaigns")
    })
    
    Swal.mixin({
        input: 'text',
        confirmButtonText: 'Next &rarr;',
        showCancelButton: true,
        reverseButtons: true,
        allowOutsideClick: false,

        progressSteps: ['1', '2', '3'] 
      }).queue([
         
          {
          title: name + " Campaign Wizard",
          // html: '<img width=200 src="/endpoint/library/'+name+'/landing.png" alt="Landing Page"><p>You\'ve selected the '+ name +' campaign.  ',
          html: "You've selected the " + name + " template. Good choice! This wizard will help you launch a campaign in a few easy steps. Let's start with a name:",
          inputPlaceholder: "Give your campaign a name.",
          inputValidator: (value) => {
            if (!value) {
              return 'Campaign name cannot be blank!'
            }
            if (value in campaigns) {
                return "Name " + value + " is already taken!"
            }
          }
        },
        {
            title: "Target Selection",
            html: "Great campaign name! Next up, let's select a target group. If you'd like to create a new target group click <a href='groups' target='_blank'>here.</a>",
            input: 'select',
            inputOptions: targets,
            inputPlaceholder: 'Select a target',
            inputValidator: (value) => {
                if (!value) {
                  return 'Please select a target'
                }
            }
        },
        {
            title: "When to send?",
            html:'<input id="datetimepicker" class="form-control">',
            onOpen: function() {
                $(".swal2-input").hide()
                $('#datetimepicker').datetimepicker({
                    format: 'MMMM Do YYYY, h:mm a',
                    defaultDate: moment()
                });
                
            },
            preConfirm: function() {
              console.log($('#datetimepicker').val())
              return Promise.resolve($('#datetimepicker').val());
              //return Promise.resolve($('#datetimepicker').datetimepicker('getDate'));
            }
        //inputPlaceholder: "GoPhish listener",
        //inputValidator: (value) => {
         //   if (!value) {
        //      return 'Listener cannot be blank!'
         //   }
        //}
        },

      ]).then((result) => {
        if (result.value) {
            console.log(result)
            campaignName = result.value[0]
            campaignTargets = result.value[1]
            //campaignListener = result.value[2]
            launchTime = result.value[2]

            randomDomain = domains[Math.floor(Math.random() * domains.length)]; 
            campaignListener = "https://" + name.replace(/\s/g, '').toLowerCase() + "." + randomDomain
       
            campaign = {  
                        "name": campaignName,
                        "template":{  
                        "name": name
                        },
                        "url":campaignListener,
                        "page":{  
                        "name":name
                        },
                        "smtp":{  
                        "name":name
                        },
                        "launch_date": moment(launchTime, "MMMM Do YYYY, h:mm a").utc().format(),
                        "groups":[  
                        {  
                            "name":campaignTargets
                        }
                        ]
                    }

            Swal.fire({
                type: "question",
                title: 'Are you sure',
                html:'This will schedule the campaign to be launched.',
                confirmButtonText: 'Launch',
                showCancelButton: true,
                reverseButtons: true,
                showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        // Submit the campaign
                        
                        api.campaigns.post(campaign)
                            .success(function (data) {
                                resolve()
                                campaign = data
                            })
                            .error(function (data) {
                                Swal.fire("Error: " + data.responseJSON.message)
                            })
                    })
                }
            }).then(function (result) {
                if (result.value){
                    Swal.fire(
                        'Campaign Scheduled!',
                        'This campaign has been scheduled for launch!',
                        'success'
                    );
                }
                $('button:contains("OK")').on('click', function () {
                    window.location = "/campaigns/" + campaign.id.toString()
                })
            })
        }// if result
      })
}

function load() {
    $("#emptyMessage").hide()
    $("#loading").show()
    api.templates.get()
    .success(function (ts) {
        templates = ts
        var pages;
        var profiles;
        var templates;
        //library = {}
        api.SMTP.get()
            .success(function (ss) {
                profiles = ss

                api.pages.get()
                    .success(function (ps) {
                        pages = ps
                        //From here we have pages, profiles, and templates.
                        if (templates.length > 0 && profiles.length >0 && pages.length > 0) {
                            //Check for same name in all three by calculating the intersection of names
                            var a=[]; var b=[];var c=[];
                            teDict={}; prDict={}; paDict={};
                            $.each(templates, function (i, template) {
                                a.push(template.name)
                                teDict[template.name]=template
                            })
                            $.each(profiles, function (i, profile) {
                                b.push(profile.name)
                                prDict[profile.name]=profile
                            })
                            $.each(pages, function (i, page) {
                                c.push(page.name)
                                paDict[page.name]=page
                            })
                            data = [a, b, c]
                            intersection = data.reduce((x, y) => x.filter(z => y.includes(z)));
                            if (intersection.length <1 ){
                                $("#loading").hide()
                                $("#emptyMessage").show()
                                return
                            }
                            //Build library
                            $.each(intersection, function (i, item) {
                                library[item] = {
                                                    "template": teDict[item],
                                                    "profile": prDict[item],
                                                    "page": paDict[item]
                                                }
                            })

                            // Sorted array of library names (since we can't sort a dictionary)
                            libraryNames = Object.keys(library).sort();

                            //Begin load table
                            $("#loading").hide()
                            $("#emptyMessage").hide()
                            
                            //Iterate over library items. Mod 3 and drop a new row.
                            libhtml = '<div class="row">'
                            //for (i = 0; i < 6; i++    ) { //For testing, bulk up the number of sims
                                $.each(libraryNames, function (index, name){
    
                                    libhtml +=
                                    '<div class="col-md-4">\
                                        <div class="panel panel-default">\
                                            <div class="panel-heading">'+ name +'</div>\
                                            <img id="img1" class="img-responsive" tooltip="Landing page" src="/endpoint/library/' + name + '/landing.png" id="Panel_Image">\
                                            <div class="panel-footer" align="right">\
                                                <button class="btn-sm btn-default" onclick="test(\'' + name + '\')"><i class="fa fa-envelope"></i> Test</button>\
                                                <button class="btn-sm btn-primary" onclick="launch(\'' + name + '\')"><i class="fa fa-envelope"></i> Launch</button>\
                                            </div>\
                                        </div>\
                                    </div>'
                                })//end iterate over library
                            //}//for testing
                            libhtml += "</div>" // Close row
                            $("#librarycontainer").html(libhtml)

                        } else {
                            $("#loading").hide()
                            $("#emptyMessage").show()
                            console.log("No library items available.")
                        }
                    })
                    .error(function () {
                        $("#loading").hide()
                        errorFlash("Error fetching pages")
                    })
            })
            .error(function () {
                $("#loading").hide()
                errorFlash("Error fetching profiles")
            })
    })
    .error(function () {
        $("#loading").hide()
        errorFlash("Error fetching templates")
    })
}

$(document).ready(function () {
    load()
});