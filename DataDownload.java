import java.io.File;
import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.google.api.client.util.Charsets;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.common.io.Files;

@SuppressWarnings("serial")

public class DataDownload extends HttpServlet {

    private DatastoreService ds = DatastoreServiceFactory.getDatastoreService();

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
	    throws ServletException, IOException {

	response.setContentType("text/plain");
	response.setCharacterEncoding("UTF-8");

	//request without parameter, for map
	if (request.getParameter("Symbol") == null) {

	    Query q = new Query("Stock Data");

	    JSONArray markerData = new JSONArray();

	    for (Entity entity : ds.prepare(q).asIterable()) {

		JSONObject symbolData = new JSONObject();

		symbolData.put("Name", entity.getKey().getName());
		symbolData.put("Longitude", entity.getProperty("LongitudeHeadquarter").toString());
		symbolData.put("Latitude", entity.getProperty("LatitudeHeadquarter").toString());

		try {
		    symbolData.put("InfoWindow",
			    Files.asCharSource(
				    new File("Ressources/Infowindows/" + entity.getKey().getName() + ".html"),
				    Charsets.UTF_8).read());
		} catch (Exception e) {
		    symbolData.put("InfoWindow", "Missing Information");
		}

		markerData.put(symbolData);
	    }

	    response.getWriter().write(markerData.toString());

	}

	//request with parameter, for chart
	if (request.getParameter("Symbol") != null) {

	    Query q = new Query(request.getParameter("Symbol")).addSort("day", SortDirection.DESCENDING);

	    List<Entity> daysList = ds.prepare(q).asList(FetchOptions.Builder.withLimit(50));

	    JSONObject baseJson = new JSONObject();

	    JSONArray openJson = new JSONArray();
	    JSONArray closeJson = new JSONArray();
	    JSONArray highJson = new JSONArray();
	    JSONArray lowJson = new JSONArray();
	    JSONArray meanJson = new JSONArray();
	    JSONArray meanSquareJson = new JSONArray();

	    for (int i = 0; i < daysList.size(); i++) {
		String x = daysList.get(i).getProperty("day").toString();
		x = x.substring(0, 4) + "/" + x.substring(4, 6) + "/" + x.substring(6, x.length());

		openJson.put(new JSONObject().put("date", x).put("value", daysList.get(i).getProperty("open").toString()));
		closeJson.put(new JSONObject().put("date", x).put("value", daysList.get(i).getProperty("close").toString()));
		highJson.put(new JSONObject().put("date", x).put("value", daysList.get(i).getProperty("high").toString()));
		lowJson.put(new JSONObject().put("date", x).put("value", daysList.get(i).getProperty("low").toString()));

		double mean = (Float.parseFloat(daysList.get(i).getProperty("low").toString())
			+ Float.parseFloat(daysList.get(i).getProperty("open").toString())
			+ Float.parseFloat(daysList.get(i).getProperty("close").toString())
			+ Float.parseFloat(daysList.get(i).getProperty("high").toString())) / 4;
		mean = Math.round(mean*10000.0)/10000.0;
		meanJson.put(new JSONObject().put("date", x).put("value", mean));
		double meanSquare = Math
			.sqrt((Math.pow(Float.parseFloat(daysList.get(i).getProperty("low").toString()), 2)
				+ Math.pow(Float.parseFloat(daysList.get(i).getProperty("open").toString()), 2)
				+ Math.pow(Float.parseFloat(daysList.get(i).getProperty("close").toString()), 2)
				+ Math.pow(Float.parseFloat(daysList.get(i).getProperty("high").toString()), 2)) / 4);
		meanSquare = Math.round(meanSquare*10000.0)/10000.0;
		meanSquareJson.put(new JSONObject().put("date", x).put("value", meanSquare));
	    }

	    baseJson.put("symbolName", request.getParameter("Symbol"));
	    baseJson.put("openData", openJson);
	    baseJson.put("closeData", closeJson);
	    baseJson.put("highData", highJson);
	    baseJson.put("lowData", lowJson);
	    baseJson.put("meanData", meanJson);
	    baseJson.put("meanSquareData", meanSquareJson);

	    response.setContentType("application/json");
	    response.getWriter().write(baseJson.toString());
	}
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
	    throws ServletException, IOException {
	doGet(request, response);
    }
}