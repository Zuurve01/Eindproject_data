d3.text("colors_complete.csv", function(error, colors) {
    d3.text("players_complete.csv", function(error, data) {

        // Function to check  if the array contains some element
        Array.prototype.contains = function(v) {
            for(var i = 0; i < this.length; i++) {
                if(this[i] === v) return true;
            }
            return false;
        };

        // Function to push new element in array
        Array.prototype.unique = function() {
            var arr = [];
            for(var i = 0; i < this.length; i++) {
                if(!arr.contains(this[i])) {
                    arr.push(this[i]);
                }
            }
            return arr; 
        }

        var data1_CSV = data;
        //--> now process CSV data using javascript.split() and friends

        // Make a list of all lines
        var lineList = data1_CSV.split("\n");

        // Define lists for the data
        var country= [];
        var country_of_club = [];
        var all_lines = [];


        // Ad data to the lists
        for (var i = 0; i < lineList.length - 1; i ++)
        {
            // Put all countries in the variable country
            country.push(lineList[i].split(",")[0]);    
            country_of_club.push(lineList[i].split(",")[11]); 

            country2 = [(lineList[i].split(",")[0])];
            country_abbreviation2 = [(lineList[i].split(",")[1])];
            continent2 = [(lineList[i].split(",")[2])];
            name_player2 = [(lineList[i].split(",")[3])];    
            role2 = [(lineList[i].split(",")[4])];
            caps2 = [(lineList[i].split(",")[5])];    
            goals2 = [(lineList[i].split(",")[6])];
            length2 = [(lineList[i].split(",")[7])];    
            first_match2 = [(lineList[i].split(",")[8])];
            birthday2 = [(lineList[i].split(",")[9])];
            club2 = [(lineList[i].split(",")[10])];
            country_of_club2 = [(lineList[i].split(",")[11])];    
            country_of_club_abbreviation2 = [(lineList[i].split(",")[12])];
            continent_of_club2 = [(lineList[i].split(",")[13].slice(0, -1))];


            all_lines.push(country2.concat(country_abbreviation2, continent2, name_player2, role2, caps2, goals2, length2,
                first_match2, birthday2, club2, country_of_club2, country_of_club_abbreviation2, continent_of_club2))        
        };


        var all_world_cup_countries = country.unique();
        var all_club_countries = country_of_club.unique();
        var all_countries = all_world_cup_countries.concat(all_club_countries).unique().sort(SortLowToHigh);


        var data2_CSV = colors;
        //--> now process CSV data using javascript.split() and friends

        // Make a list of all lines
        var lineList2 = data2_CSV.split("\n");

        var all_colors = [];

        for (var i = 0; i < lineList2.length - 1; i ++)
        {
            country = [(lineList2[i].split(",")[0])];
            country_abb = [(lineList2[i].split(",")[1])];
            color_1 = [(lineList2[i].split(",")[2])];
            color_2 = [(lineList2[i].split(",")[3])];
            continent = [(lineList2[i].split(",")[4].slice(0, -1))];
         all_colors.push(country.concat(country_abb, color_1, color_2, continent))

        }

        all_colors = all_colors.sort(SortLowToHigh);



        // Set the margins of the svg
        var margin = {top: 10, right: 20, bottom: 5, left: 40},
            width = 1740,
            height = 880;

        // Make the svg
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define the maximum value of competition countries (England competition: 120 players)
        var max_value = 120
        // Define variable for the value of a world cup team selection
        var wc_team_amount = 23;
        // Define variabele for the maximum amount of playernames below each other
        var max_player_names = 44;
        // Define variable for the horizontal distance between player names
        var distance_x_player_names = 200;
        // Define variable for correction on text places
        var text_place_cor = 20;
        // Define variable that's useful to divided by to determine the height of a bar
        var divided_for_height_bar = 1.361
        // Define variable that's useful to diveded by to determine the y location of a bar
        var divided_for_loc_bar = 1.025
        // Define variables that's used to shift the leftbars and belongings
        var shift_left_bars = 550
        // Define a variable for the width of the second little bar
        var width_little_bar = 4
        // Define a variable for correction on line places
        var line_place_cor = 35
        // Defina a variable for correction of the vertical place of the abbreviation
        var ab_and_val_place_cor = 6
        // Define variable for the distance between title1 and the showed country name
        var shift_country_name = 160


        // Translate the pixels to the values and call it withScale
        var widthScale = d3.scale.linear()
        .domain([0, max_value])
        .range([0, 1 / 2 * width])

        // Define the values for the selected countries and set them to the ones that are checked from the beginning
        var value_left = "the world"
        var value_right = "the world"

        // Show the bars of the initial selection
        make_the_bars(value_left, value_right)

        // If the selection will be changed, call the function that reload the correct bars
        d3.select(".form_left").selectAll("input").on("change", change_left)
        d3.select(".form_right").selectAll("input").on("change", change_right)

        // Define some variables that are used to make the bars
        var selection_club_countries
        var selection_wc_countries

        var clicked_array
        var clicked_array_2

        function SortLowToHigh(a, b) {
            if (a > b) return 1;
            else if (a < b) return -1;
            else return 0;
        }


        function change_left() {
            value_left = this.value
            make_the_bars(value_left, value_right)
        }


        function change_right() {
            value_right = this.value
            make_the_bars(value_left, value_right)
        }


        function make_the_bars(world_cup_continent, club_continent)
        {
            svg.selectAll("*").remove()

            selection_club_countries = make_selection_of_club_countries(club_continent)
            selection_wc_countries = make_selection_of_world_cup_countries(world_cup_continent)

            make_the_left_bars(world_cup_continent, club_continent)
            make_the_right_bars(world_cup_continent, club_continent)

            // Make a title above the world cup team bars
            var title_1 = svg
            .append("svg:text")
            .attr("x", widthScale(wc_team_amount) / 2)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .style("font-size","18px")
            .style("font-weight", "bold")
            .text("World cup teams")
            .attr("transform", "translate(" + shift_left_bars +"," + 0 + ")");

            // Make a title above the National competition bars
            var title_2 = svg
            .append("svg:text")
            .attr("x",  1/2 * width + widthScale(wc_team_amount) / 2 + text_place_cor)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .style("font-size","18px")
            .style("font-weight", "bold")
            .text("National competitions");


                var abbreviation_by_bars_left = svg.selectAll("abbreviation_by_bars2")
                .data(selection_wc_countries)
                .enter()
                .append("svg:text")
                .attr("x", function(d, index) { return widthScale(wc_team_amount); })
                .attr("y", function(d,i) {return i * height / selection_wc_countries.length / divided_for_loc_bar; })
                .attr("dx", text_place_cor)
                .attr("dy", height / selection_wc_countries.length / divided_for_height_bar / 2 + ab_and_val_place_cor)
                .attr("text-anchor", "middle")
                .text(function(d) { return calculate_abbreviation(d);})
                .attr("fill", "black")
                .attr("transform", "translate(" + shift_left_bars +"," + 25 + ")")

                var abbreviation_by_bars_right = svg.selectAll("abbreviation_by_bars")
                .data(selection_club_countries)
                .enter()
                .append("svg:text")
                .attr("x", function(d) { return 1 /2 * width + 1; })
                .attr("y", function(d,i) {return i * height / selection_club_countries.length / divided_for_loc_bar; })
                .attr("dx", -text_place_cor)
                .attr("dy", height / selection_club_countries.length / divided_for_height_bar / 2 + ab_and_val_place_cor)
                .attr("text-anchor", "middle")
                .text(function(d) { return calculate_abbreviation(d);})
                .attr("fill", "black")
                .attr("transform", "translate(" + 0 +"," + 25 + ")")
        }


        function make_the_left_bars(wc_selection, club_selection)
        {
            var data_input = calculate_values_of_countries(wc_selection, club_selection)[1]

            // Define a variable to remember if there is clicked on a specific world cup team bar 
            clicked_array = Array.apply(null, new Array(data_input.length)).map(Number.prototype.valueOf,0);


            var bars1_left = svg.selectAll("rect3")
                .data(calculate_values_of_countries(wc_selection, club_selection)[1])
                .enter()
                .append("rect")
                .attr("class", "bar_left")
                .attr("id", "mainbar_left")
                .attr("width", function(d) { return widthScale(d); })
                .attr("height", height / selection_wc_countries.length / divided_for_height_bar)
                .attr("y", function(d,i) {return i * height / selection_wc_countries.length / divided_for_loc_bar; })
                .attr("x", function(d) { return 0 + widthScale(wc_team_amount - d); })
                .attr("fill", function(d,i) {return calculate_colors(selection_wc_countries[i])[0]; })
                .attr("stroke-width", 1)
                .attr("stroke", "black")
                .on("click", function(d,i) { 

                    // Remove the playerlist and profile
                    d3.selectAll(".playerlist").remove()
                    d3.selectAll(".player_profile").remove()

                    // console.log(clicked_array_2.indexOf(1))
                    // Check if there is clicked on a bar on the right side
                    if (clicked_array_2.indexOf(1) < 0)
                    {
                      // Set all the clickvalues back to null and update the value that's clicked
                      clicked_array = change_zero_one(clicked_array, i)

                      // Remove the left bar, because that one will be updated and remove the playerlist and lines
                      d3.selectAll(".bar_right").remove(),
                      d3.selectAll(".lines").remove()

                      // If a bar of a world cup team is clicked for the first time, show the specific details and updated the bars
                      if (clicked_array[i] == 1)
                      {
                        make_the_right_bars(selection_wc_countries[i], club_selection),
                        show_list_right(which_players_in_country(selection_wc_countries[i], wc_selection, club_selection)[1]),
                        make_lines_from_left(selection_wc_countries[i], club_selection, i)

                      }
                      // If a bar of a world cup team is clicked for the second time in a row, hide the specific details and show the main bars on the right
                      if (clicked_array[i] == 0)
                      {
                          make_the_right_bars(wc_selection, club_selection)       
                      };
                    }
                    // If there is clicked on a bar on the right, only update the list
                    else
                    {
                      show_list_left(which_players_in_country(selection_wc_countries[i], wc_selection, club_selection)[1])
                    }
                })
                .on("mouseover", function(d, i){ return show_full_country_name(selection_wc_countries[i]); })
                .on("mouseout", function(d, i){ return d3.selectAll(".full_name").remove(); })
                .attr("transform", "translate(" + shift_left_bars +"," + 25 + ")")


            // Set the values along the bars
            var values_by_bars_left = svg.selectAll("text_by_bars2")
                .data(calculate_values_of_countries(wc_selection, club_selection)[1])
                .enter()
                .append("svg:text")
                .attr("class", "bar_left")
                .attr("x", function(d) { return 0 + widthScale(wc_team_amount - d); })
                .attr("y", function(d,i) {return i * height / selection_wc_countries.length / divided_for_loc_bar; })
                .attr("dx", -text_place_cor/2)
                .attr("dy", height / selection_wc_countries.length / divided_for_height_bar / 2 + ab_and_val_place_cor)
                .attr("text-anchor", "middle")
                .text(function(d) { return d;})
                .attr("fill", "black")
                .attr("transform", "translate(" + shift_left_bars +"," + 25 + ")")

                // Make the bars of the data_plot that's generated
                var bars2_left = svg.selectAll("rect4")
                .data(calculate_values_of_countries(wc_selection, club_selection)[1])
                .enter()
                .append("rect")
                .attr("class", "bar_left")
                .attr("width", function(d) { return little_bar_or_not(d); })
                .attr("height", height / selection_wc_countries.length / divided_for_height_bar)
                .attr("y", function(d,i) {return i * height / selection_wc_countries.length / divided_for_loc_bar; })
                .attr("x", widthScale(wc_team_amount))
                .attr("fill", function(d,i) {return  calculate_colors(selection_wc_countries[i])[1]; })
                .attr("stroke-width", 1)
                .attr("stroke", "black")
                .attr("transform", "translate(" + shift_left_bars +"," + 25 + ")")
        }


        function make_the_right_bars(wc_selection, club_selection)
        {
            var data_input = calculate_values_of_countries(wc_selection, club_selection)[0]

            // Define a variable to remember if there is clicked on a specific world cup team bar 
            clicked_array_2 = Array.apply(null, new Array(data_input.length)).map(Number.prototype.valueOf,0);

            var bars1_right = svg.selectAll("rect1")
                .data(data_input)
                .enter()
                .append("rect")
                .attr("class", "bar_right")
                .attr("id", "mainbar_right")
                .attr("width", function(d) { return widthScale(d); })
                .attr("height", height / selection_club_countries.length / divided_for_height_bar)
                .attr("y", function(d,i) {return i * height / selection_club_countries.length / divided_for_loc_bar; })
                .attr("x", 1 /2 * width)
                .attr("fill", function(d,i) {return calculate_colors(selection_club_countries[i])[0]; })
                .attr("stroke-width", 1)
                .attr("stroke", "black")
                .on("click", function(d,i) {

                    // Remove the playerlist and profile
                    d3.selectAll(".playerlist").remove()
                    d3.selectAll(".player_profile").remove()

                    // Check if there is clicked on a bar on the right side
                    if (clicked_array.indexOf(1) < 0)
                    {
                      // Set all the clickvalues back to null and update the value that's clicked
                      clicked_array_2 = change_zero_one(clicked_array_2, i)

                      // Remove the left bar, because that one will be updated and remove the playerlist and lines
                      d3.selectAll(".bar_left").remove(),
                      d3.selectAll(".lines").remove()

                      // If a bar of a world cup team is clicked for the first time, show the specific details and updated the bars
                      if (clicked_array_2[i] == 1)
                      {
                        make_the_left_bars(wc_selection, selection_club_countries[i]),
                        show_list_left(which_players_in_country(selection_club_countries[i], wc_selection, club_selection)[0]),
                        make_lines_from_right(wc_selection, selection_club_countries[i], i)

                      }
                      // If a bar of a world cup team is clicked for the second time in a row, hide the specific details and show the main bars on the right
                      if (clicked_array_2[i] == 0)
                      {
                        make_the_left_bars(wc_selection, club_selection)       
                      };
                    }
                    // If there is clicked on a bar on the right, only update the list
                    else
                    {
                      show_list_right(which_players_in_country(selection_club_countries[i], wc_selection, club_selection)[0])
                    }; 
                })
                .on("mouseover", function(d, i){ return show_full_country_name(selection_club_countries[i]); })
                .on("mouseout", function(d, i){ return d3.selectAll(".full_name").remove(); })
                .attr("transform", "translate(" + 0 +"," + 25 + ")")

            // Set the values along the bars
            var values_by_bars_right = svg.selectAll("text_by_bars")
                .data(calculate_values_of_countries(wc_selection, club_selection)[0])
                .enter()
                .append("svg:text")
                .attr("class", "bar_right")
                .attr("x", function(d) { return 1 /2 * width + 1 + widthScale(d); })
                .attr("y", function(d,i) {return i * height / selection_club_countries.length / divided_for_loc_bar; })
                .attr("dx", text_place_cor/2)
                .attr("dy", height / selection_club_countries.length / divided_for_height_bar / 2 + ab_and_val_place_cor)
                .attr("text-anchor", "middle")
                .text(function(d) { return d;})
                .attr("fill", "black")
                .attr("transform", "translate(" + 0 +"," + 25 + ")")




            // Make the bars of the data_plot that's generated
            var bars2_right = svg.selectAll("rect2")
                .data(calculate_values_of_countries(wc_selection, club_selection)[0])
                .enter()
                .append("rect")
                .attr("class", "bar_right")
                .attr("width", function(d) { return little_bar_or_not(d); })
                .attr("height", height / selection_club_countries.length / divided_for_height_bar)
                .attr("y", function(d,i) {return i * height / selection_club_countries.length / divided_for_loc_bar; })
                .attr("x", 1 /2 * width - width_little_bar)
                .attr("fill", function(d,i) {return calculate_colors(selection_club_countries[i])[1]; })
                .attr("stroke-width", 1)
                .attr("stroke", "black")
                .attr("transform", "translate(" + 0 +"," + 25 + ")")
        }


        function make_lines_from_left(wc_selection, club_selection, input)
        {
            var values = calculate_values_of_countries(wc_selection, club_selection)[0]

            for (var i = 0; i < values.length; i ++)
            {
                if (values[i] > 0)
                {
                var line = svg
                    .append("line")
                    .attr("class", "lines")       
                    .attr("x1", widthScale(wc_team_amount) + shift_left_bars + line_place_cor)
                    .attr("y1", input * height / selection_wc_countries.length / divided_for_loc_bar + 1 / 2 * height / selection_wc_countries.length / divided_for_height_bar)
                    .attr("x2",  1 /2 * width - line_place_cor)
                    .attr("y2", i * height / selection_club_countries.length / divided_for_loc_bar + + 1 / 2 * height / selection_club_countries.length / divided_for_height_bar)
                    .attr("stroke", "green")
                    .attr("stroke-width", 1)
                    .attr("transform", "translate(" + 0 +"," + 25 + ")")
                }
            }
        }


        function make_lines_from_right(wc_selection, club_selection, input)
        {
            var values = calculate_values_of_countries(wc_selection, club_selection)[1]

            for (var i = 0; i < values.length; i ++)
            {
                if (values[i] > 0)
                {
                var line = svg
                    .append("line")
                    .attr("class", "lines")       
                    .attr("x1", widthScale(wc_team_amount) + shift_left_bars + line_place_cor)
                    .attr("y1", i * height / selection_wc_countries.length / divided_for_loc_bar + 1 / 2 * height / selection_wc_countries.length / divided_for_height_bar)
                    .attr("x2",  1 /2 * width - line_place_cor)
                    .attr("y2", input * height / selection_club_countries.length / divided_for_loc_bar + 1 / 2 * height / selection_club_countries.length / divided_for_height_bar)
                    .attr("stroke", "green")
                    .attr("stroke-width", 1)
                    .attr("transform", "translate(" + 0 +"," + 25 + ")")
                }
            }
        }


        function show_list_left(input)
        {

            var player_list = svg.selectAll("playerlist")
            .data(input)
            .enter()
            .append("svg:text")
            .attr("class", "playerlist")
            .attr("x", function(d,i) { return parseInt(i / max_player_names) * distance_x_player_names;})
            .attr("y", margin.top)
            .attr("dy", function(d,i) {
                    return (i - max_player_names * parseInt(i / max_player_names)) * text_place_cor; })
            .attr("text-anchor", "right")
            .attr("fill", "black")
            .text(function(d) { return d; })
            .on("click", function(d) { return make_player_profile(d); });

        }


        function show_list_right(input)
        {

            var player_list = svg.selectAll("playerlist")
            .data(input)
            .enter()
            .append("svg:text")
            .attr("class", "playerlist")
            .attr("x", width - distance_x_player_names)
            .attr("y", margin.top)
            .attr("dy", function(d,i) {return i * text_place_cor; })
            .attr("text-anchor", "right")
            .attr("fill", "black")
            .text(function(d) { return d; })
            .on("click", function(d) { return make_player_profile(d); });

        }

        function show_full_country_name(input){
            // Show the full name of the specific country
            var full_name_left = svg
            .append("svg:text")
            .attr("x",  widthScale(wc_team_amount) / 2 + shift_country_name)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr("class", "full_name")
            .style("font-size","18px")
            .text(input)
            .attr("transform", "translate(" + shift_left_bars +"," + 0 + ")");;
        }

        function make_player_profile(input) {

          d3.selectAll(".player_profile").remove()
          var player_profile = []

          for (var i = 0; i < all_lines.length; i ++)
            {
                if (all_lines[i][3] == input)
                {   // Name
                    player_profile.push(["Name: ", all_lines[i][3]])
                    // World cup country
                    player_profile.push(["Nationality: ", all_lines[i][0]])
                    // Position
                    player_profile.push(["Position: ", all_lines[i][4]])
                    // International caps
                    player_profile.push(["International caps: ", all_lines[i][5]])
                    // International goals
                    player_profile.push(["International goals: ", all_lines[i][6]])
                    // Length
                    player_profile.push(["Length: ", all_lines[i][7], " cm"])
                    // First match
                    player_profile.push(["First International: ",all_lines[i][8]])
                    // Date of birth
                    player_profile.push(["Date of birth: ", all_lines[i][9]])
                    // Current club
                    player_profile.push(["Club: ", all_lines[i][10], " (", all_lines[i][11], ")"])

                }
            }

            svg
            .append("rect")
            .attr("class", "player_profile")
            .attr("width", 370)
            .attr("height", 180)
            .attr("y", 1 / 11 * height - text_place_cor + ab_and_val_place_cor)
            .attr("x", 2/ 3 * width)
            .attr("rx", 10)
            .attr("ry", 10)
            
            .attr("fill", "#9FD6E8")
            .attr("stroke-width", 1)
            .attr("stroke", "green")

            svg.selectAll("player_profile")
            .data(player_profile)
            .enter()
            .append("svg:text")
            .attr("class", "player_profile")
            .attr("font-size", "20px")
            .attr("text-anchor", "right")
            .attr("y", 1 / 11 * height)
            .attr("x", 2 / 3 * width + ab_and_val_place_cor)
            .attr("dy", function(d,i) { return 20 * i; })
            .style("fill", "black")
            .text(function(d,i) { return player_profile[i].join(""); });

        }


        // Set all the clickvalues back to null and update the value that's clicked
        function change_zero_one(array, index)
        {

            for (var i = 0; i < array.length; i ++)       
                if (i != index || array[i] == 1)
                {
                    array[i] = 0
                }
                else
                {
                    array[i] =  1
                }
            return array
        }


        function little_bar_or_not(d)
        {
            if (d > 0)
            {
                return width_little_bar
            }
            else
            {
                return 0
            }
        }


        // Function to calculate which countries belong to the selected continent
        function make_selection_of_club_countries(selection) {
            var list_of_countries = [];
            for (var i = 0; i < all_colors.length; i ++)
            {
                if (all_colors[i][4] == selection || selection == "the world")
                {
                    list_of_countries.push(all_colors[i][0]);
                }
            }
            return list_of_countries;
        }


        // Function to calculate which countries belong to the selected continent
        function make_selection_of_world_cup_countries(selection) {
            var list_of_countries = [];

            for (var i = 0; i < all_lines.length; i ++)
            {
                if (all_lines[i][2] == selection || selection == "the world")
                {
                    list_of_countries.push(all_lines[i][0]);
                }
            }
            list_of_countries = list_of_countries.unique();
            return list_of_countries.sort(SortLowToHigh);
        }


        // Calculate the values of the countries
        function calculate_values_of_countries(wc_selection, club_selecton) {
            var data_plot1 = [];
            var data_plot2 = [];

            // Als 1 van de 2 een land is, dan loopt ie over de desbetreffende loop maar 1 keer, zoals gewenst
            var world_cup_countries = make_selection_of_world_cup_countries(wc_selection);
            var club_countries = make_selection_of_club_countries(club_selecton);

            for (var i = 0; i < club_countries.length; i ++)
            {
                data_plot1.push(which_players_in_country(club_countries[i], wc_selection, club_selecton)[0].length);
                
            }
            for (var i = 0; i < world_cup_countries.length; i ++)
            {
            data_plot2.push(which_players_in_country(world_cup_countries[i], wc_selection, club_selecton)[1].length);
                
            }

            return [data_plot1, data_plot2];
        }


        function which_players_in_country(country, wc_selection, club_selection) {
            var list_of_players_in = [];
            var list_of_players_for = [];

            for (var i = 0; i < all_lines.length; i ++)
            {
                if (all_lines[i][11] == country && (wc_selection == "the world" ||all_lines[i][2] == wc_selection || all_lines[i][0] == wc_selection))
                {
                    list_of_players_in.push(all_lines[i][3]);
                }
                if (all_lines[i][0] == country && (club_selection == "the world" || all_lines[i][13] == club_selection || all_lines[i][11] == club_selection))
                {
                    list_of_players_for.push(all_lines[i][3]);
                }        
            }

            return [list_of_players_in, list_of_players_for];
        }


        // Calculate the colors of the country
        function calculate_colors(country)
        {
            index_country = all_countries.indexOf(country);
            color_1 = all_colors[index_country][2];
            color_2 = all_colors[index_country][3];
            return [color_1, color_2];
        }

        function calculate_abbreviation(country)
        {
            index_country = all_countries.indexOf(country);
            abbreviation= all_colors[index_country][1];

            return abbreviation;
        }
    });
});
