import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.sql.*;
import java.util.stream.Collectors;

public class ChatServer {

    static final String DB_URL = "jdbc:sqlserver://localhost:1433;databaseName=ChatAppDB;trustServerCertificate=true";
    static final String DB_USER = "chatAppAdmin";
    static final String DB_PASS = "venkatesh3002@galaxe";

    private static void setCORSHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
    }

    public static void main(String[] args) throws Exception {
        Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/signup", ChatServer::handleSignup);
        server.createContext("/login", ChatServer::handleLogin);
        server.setExecutor(null);
        server.start();
        System.out.println("Server running on port 8080");
    }

    private static void handleSignup(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);

        // Handle OPTIONS preflight request
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        try {
            String body = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                             .lines().collect(Collectors.joining(""));

            String[] parts = body.split("&");
            if (parts.length < 2) {
                sendResponse(exchange, 400, "Invalid request format");
                return;
            }

            String username = parts[0].split("=")[1];
            String password = parts[1].split("=")[1];

            // Basic validation
            if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                sendResponse(exchange, 400, "Username and password are required");
                return;
            }

            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                // Check if username exists first
                PreparedStatement checkStmt = conn.prepareStatement("SELECT username FROM Users WHERE username = ?");
                checkStmt.setString(1, username);
                ResultSet rs = checkStmt.executeQuery();

                if (rs.next()) {
                    sendResponse(exchange, 409, "Username already exists");
                    return;
                }

                // Insert new user
                PreparedStatement insertStmt = conn.prepareStatement(
                    "INSERT INTO Users (username, password) VALUES (?, ?)");
                insertStmt.setString(1, username);
                insertStmt.setString(2, password);
                insertStmt.executeUpdate();

                sendResponse(exchange, 200, "{\"status\":\"success\",\"message\":\"Signup successful\"}");
            }
        } catch (SQLException e) {
            sendResponse(exchange, 500, "{\"status\":\"error\",\"message\":\"Database error: " + e.getMessage() + "\"}");
        } catch (Exception e) {
            sendResponse(exchange, 400, "{\"status\":\"error\",\"message\":\"Invalid request\"}");
        }
    }

    private static void handleLogin(HttpExchange exchange) throws IOException {
        setCORSHeaders(exchange);

        // Handle OPTIONS preflight request
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (!"POST".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        try {
            String body = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                             .lines().collect(Collectors.joining(""));

            String[] parts = body.split("&");
            if (parts.length < 2) {
                sendResponse(exchange, 400, "Invalid request format");
                return;
            }

            String username = parts[0].split("=")[1];
            String password = parts[1].split("=")[1];

            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
                PreparedStatement stmt = conn.prepareStatement(
                    "SELECT username FROM Users WHERE username = ? AND password = ?");
                stmt.setString(1, username);
                stmt.setString(2, password);
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    String response = String.format("{\"status\":\"success\",\"username\":\"%s\"}", username);
                    sendResponse(exchange, 200, response);
                } else {
                    sendResponse(exchange, 401, "{\"status\":\"error\",\"message\":\"Invalid credentials\"}");
                }
            }
        } catch (SQLException e) {
            sendResponse(exchange, 500, "{\"status\":\"error\",\"message\":\"Database error\"}");
        } catch (Exception e) {
            sendResponse(exchange, 400, "{\"status\":\"error\",\"message\":\"Invalid request\"}");
        }
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(response.getBytes());
        }
    }
}