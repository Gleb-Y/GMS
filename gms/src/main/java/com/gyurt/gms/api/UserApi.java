package com.gyurt.gms.api;

import com.gyurt.gms.dto.ApiResponse;
import com.gyurt.gms.repo.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RequestMapping("/api/users")
@Tag(name = "user-controller", description = "user endpoints")
public interface UserApi {
    @PostMapping
    ResponseEntity<ApiResponse<User>> create(@Valid @RequestBody User user);

    @GetMapping("/{email}")
    ResponseEntity<ApiResponse<User>> findByEmail(@PathVariable String email);

    @PutMapping
    ResponseEntity<ApiResponse<User>> update(@Valid @RequestBody User user);

    @DeleteMapping("/{id}")
    ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id);
}
